import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

export async function GET(
  request: NextRequest,
  context: { params: { username: string } | Promise<{ username: string }> }
) {
  try {
    await ensureDatabaseInitialized();
    const resolvedParams = await Promise.resolve(context.params);
    const rawUsername = resolvedParams.username?.toLowerCase()?.trim();

    if (!rawUsername) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Lookup user by username or ID
    const user = await queryOne<any>(
      `SELECT id, full_name, email, username, role, merit_score, is_profile_public, bio, created_at 
       FROM users 
       WHERE LOWER(username) = ? OR id = ?`,
      [rawUsername, rawUsername]
    );

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const currentSession = await getServerSession();
    const isOwner = currentSession?.userId === user.id;
    const isPublic = user.is_profile_public === 1 || user.is_profile_public === true || user.is_profile_public === "1";

    // Privacy barrier
    if (!isPublic && !isOwner) {
      return NextResponse.json({
        isPrivate: true,
        profile: {
          full_name: user.full_name,
          username: user.username || rawUsername,
        },
      });
    }

    // Fetch user's completed submissions
    const submissions = await query<any>(
      `SELECT s.id, s.task_id, s.overall_band, s.word_count, s.status, s.time_spent_seconds, s.created_at,
              COALESCE(t.title, 'Academic Writing Task') as task_title,
              COALESCE(t.task_type, 'task_2') as task_type
       FROM submissions s
       LEFT JOIN writing_tasks t ON s.task_id = t.id
       WHERE s.user_id = ? AND s.status = 'completed'
       ORDER BY s.created_at ASC`,
      [user.id]
    );

    // Fetch words saved count
    const wordsSavedRow = await queryOne<any>(
      "SELECT COUNT(*) as count FROM study_assets WHERE user_id = ?",
      [user.id]
    );
    const wordsSaved = Number(wordsSavedRow?.count || 0);

    // Activity aggregation for Heatmap & Streak
    // Map dates YYYY-MM-DD -> { count: number, seconds: number }
    const activityMap: Record<string, { count: number; seconds: number }> = {};
    for (const sub of submissions) {
      if (!sub.created_at) continue;
      const dateStr = new Date(sub.created_at).toISOString().split("T")[0];
      if (!activityMap[dateStr]) {
        activityMap[dateStr] = { count: 0, seconds: 0 };
      }
      activityMap[dateStr].count += 1;
      activityMap[dateStr].seconds += Number(sub.time_spent_seconds || 1200);
    }

    // Calculate streak
    const activeDates = Object.keys(activityMap).sort().reverse();
    let currentStreak = 0;
    if (activeDates.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split("T")[0];

      // Streak is active if user studied today or yesterday
      let checkDate = new Date(activeDates[0]);
      const latestActive = activeDates[0];
      if (latestActive === today || latestActive === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < activeDates.length; i++) {
          const prev = new Date(activeDates[i - 1]);
          const curr = new Date(activeDates[i]);
          const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Stats calculations
    const testsTaken = submissions.length;
    const totalTimeSeconds = submissions.reduce((acc, s) => acc + Number(s.time_spent_seconds || 1200), 0);
    const totalTimeMinutes = Math.round(totalTimeSeconds / 60);
    const bands = submissions.map((s) => Number(s.overall_band || 0)).filter((b) => b > 0);
    const averageBand = bands.length > 0 ? Number((bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1)) : 0;
    const highestBand = bands.length > 0 ? Math.max(...bands) : 0;

    // Progress trend (chronological)
    const trend = submissions.map((s) => ({
      id: s.id,
      title: s.task_title,
      task_type: s.task_type,
      band: Number(s.overall_band || 0),
      word_count: Number(s.word_count || 0),
      date: s.created_at,
    }));

    // Latest 5 submissions (newest first)
    const latestSubmissions = [...trend].reverse().slice(0, 5);

    // Achievements calculation
    const badges = [
      {
        id: "spark",
        name: "Spark",
        category: "streak",
        description: "Maintain a 3-day active writing streak",
        threshold: 3,
        current: currentStreak,
        unlocked: currentStreak >= 3,
        icon: "Flame",
      },
      {
        id: "week_of_fire",
        name: "Week of Fire",
        category: "streak",
        description: "Maintain a 7-day active writing streak",
        threshold: 7,
        current: currentStreak,
        unlocked: currentStreak >= 7,
        icon: "Flame",
      },
      {
        id: "fortnight_flame",
        name: "Fortnight Flame",
        category: "streak",
        description: "Maintain a 14-day active writing streak",
        threshold: 14,
        current: currentStreak,
        unlocked: currentStreak >= 14,
        icon: "Flame",
      },
      {
        id: "month_of_fire",
        name: "Month of Fire",
        category: "streak",
        description: "Maintain a 30-day active writing streak",
        threshold: 30,
        current: currentStreak,
        unlocked: currentStreak >= 30,
        icon: "Flame",
      },
      {
        id: "first_essay",
        name: "First Essay",
        category: "essays",
        description: "Complete your first timed writing evaluation",
        threshold: 1,
        current: testsTaken,
        unlocked: testsTaken >= 1,
        icon: "Award",
      },
      {
        id: "dedicated_writer",
        name: "Dedicated Writer",
        category: "essays",
        description: "Complete 10 full IELTS writing evaluations",
        threshold: 10,
        current: testsTaken,
        unlocked: testsTaken >= 10,
        icon: "Award",
      },
      {
        id: "band_7_achiever",
        name: "Band 7.0+ Achiever",
        category: "band",
        description: "Score Band 7.0 or higher on an official task",
        threshold: 7.0,
        current: highestBand,
        unlocked: highestBand >= 7.0,
        icon: "Star",
      },
      {
        id: "band_8_master",
        name: "Band 8.0+ Master",
        category: "band",
        description: "Score Band 8.0 or higher on an official task",
        threshold: 8.0,
        current: highestBand,
        unlocked: highestBand >= 8.0,
        icon: "Crown",
      },
      {
        id: "vocabulary_builder",
        name: "Vocabulary Builder",
        category: "vocabulary",
        description: "Save 20 study takeaways or vocabulary cards",
        threshold: 20,
        current: wordsSaved,
        unlocked: wordsSaved >= 20,
        icon: "BookOpen",
      },
    ];

    return NextResponse.json({
      success: true,
      isOwner,
      isPrivate: false,
      profile: {
        id: user.id,
        full_name: user.full_name,
        username: user.username || rawUsername,
        merit_score: user.merit_score,
        bio: user.bio,
        is_profile_public: isPublic,
        created_at: user.created_at,
      },
      stats: {
        testsTaken,
        totalTimeMinutes,
        currentStreak,
        wordsSaved,
        averageBand,
        highestBand,
      },
      latestSubmissions,
      trend,
      activityMap,
      badges,
    });
  } catch (error: any) {
    console.error("Error in /api/u/[username] GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
