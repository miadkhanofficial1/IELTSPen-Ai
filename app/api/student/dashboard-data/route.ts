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
      "SELECT id, full_name, email, role, native_language, merit_score, locked_until, created_at FROM users WHERE id = ?",
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

    return NextResponse.json({
      success: true,
      profile: profile || {
        id: session.userId,
        full_name: session.fullName,
        email: session.email,
        role: session.role,
        native_language: session.nativeLanguage || "English",
        merit_score: 100,
        locked_until: null,
      },
      globalAnnouncement: settings?.global_announcement || null,
      tasks,
      submissions,
      activeAppeal: activeAppeal || null,
    });
  } catch (error: any) {
    console.error("Error in /api/student/dashboard-data GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update student profile preference (e.g. native language)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nativeLanguage } = await request.json();
    if (nativeLanguage) {
      await execute("UPDATE users SET native_language = ? WHERE id = ?", [
        nativeLanguage,
        session.userId,
      ]);
    }

    return NextResponse.json({ success: true, nativeLanguage });
  } catch (error: any) {
    console.error("Error in /api/student/dashboard-data POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
