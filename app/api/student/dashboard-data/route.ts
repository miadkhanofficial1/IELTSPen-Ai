import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { query, queryOne, execute, parseJson } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

// GET: Load all Student Dashboard datasets
export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. User Profile
    const profile = await queryOne<any>(
      "SELECT id, full_name, email, username, role, native_language, merit_score, is_profile_public, bio, locked_until, created_at FROM users WHERE id = ?",
      [session.userId]
    );

    // 2. Global Announcement
    const settings = await queryOne<{ global_announcement: string | null }>(
      "SELECT global_announcement FROM system_settings WHERE id = 1"
    );

    // 3. Published Tasks (100% real database records only)
    const rawTasks = await query<any>(
      "SELECT * FROM writing_tasks WHERE status = 'published' ORDER BY published_at DESC, created_at DESC"
    );
    const tasks = rawTasks.map((t) => ({
      ...t,
      chart_data: parseJson(t.chart_data, null),
      vocabulary_assets: parseJson(t.vocabulary_assets, []),
    }));

    // 4. Student Submissions
    const rawSubmissions = await query<any>(
      "SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC",
      [session.userId]
    );
    const submissions = rawSubmissions.map((s) => ({
      ...s,
      essay_text: s.essay_text || s.student_essay || "",
      criteria_scores: parseJson(s.criteria_scores, null),
      corrections: parseJson(s.corrections, []),
    }));

    // 5. Active Appeal (if any)
    const activeAppeal = await queryOne<any>(
      "SELECT * FROM unlock_appeals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [session.userId]
    );

    // 6. User Achievements from database
    const rawAchievements = await query<any>(
      "SELECT * FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC",
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      profile: profile
        ? {
            ...profile,
            is_profile_public: profile.is_profile_public === 1 || profile.is_profile_public === true || profile.is_profile_public === "1",
          }
        : {
            id: session.userId,
            full_name: session.fullName,
            email: session.email,
            username: session.email?.split("@")[0]?.toLowerCase()?.replace(/[^a-z0-9_]/g, "") || "student",
            role: session.role,
            native_language: session.nativeLanguage || "English",
            merit_score: 100,
            is_profile_public: true,
            bio: null,
            locked_until: null,
          },
      globalAnnouncement: settings?.global_announcement || null,
      tasks,
      submissions,
      achievements: rawAchievements || [],
      activeAppeal: activeAppeal || null,
    });
  } catch (error: any) {
    console.error("Error in /api/student/dashboard-data GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update student profile preference (e.g. native language, full name, username, bio, visibility)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nativeLanguage, fullName, username, bio, isProfilePublic } = body;

    // Validate username if provided
    if (username !== undefined && username !== null) {
      const cleanUsername = String(username).trim().toLowerCase();
      if (cleanUsername.length > 0) {
        if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
          return NextResponse.json(
            { error: "Username must be 3-30 characters and contain only letters, numbers, and underscores." },
            { status: 400 }
          );
        }

        // Check if taken by another user
        const existing = await queryOne<any>(
          "SELECT id FROM users WHERE username = ? AND id != ?",
          [cleanUsername, session.userId]
        );
        if (existing) {
          return NextResponse.json(
            { error: "This username is already taken. Please choose another one." },
            { status: 409 }
          );
        }

        await execute("UPDATE users SET username = ? WHERE id = ?", [cleanUsername, session.userId]);
      }
    }

    if (nativeLanguage) {
      await execute("UPDATE users SET native_language = ? WHERE id = ?", [
        nativeLanguage,
        session.userId,
      ]);
    }

    if (fullName && typeof fullName === "string" && fullName.trim()) {
      await execute("UPDATE users SET full_name = ? WHERE id = ?", [
        fullName.trim(),
        session.userId,
      ]);
    }

    if (bio !== undefined) {
      const bioText = typeof bio === "string" ? bio.trim().slice(0, 500) : null;
      await execute("UPDATE users SET bio = ? WHERE id = ?", [bioText, session.userId]);
    }

    if (isProfilePublic !== undefined) {
      const isPublic = isProfilePublic ? 1 : 0;
      await execute("UPDATE users SET is_profile_public = ? WHERE id = ?", [isPublic, session.userId]);
    }

    return NextResponse.json({
      success: true,
      updated: {
        fullName,
        nativeLanguage,
        username,
        bio,
        isProfilePublic,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/student/dashboard-data POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
