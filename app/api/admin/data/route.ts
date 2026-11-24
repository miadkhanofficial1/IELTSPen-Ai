import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, queryOne, execute, parseJson } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

// GET: Load all Admin Studio datasets in one fast roundtrip
export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    // 1. Tasks
    const rawTasks = await query<any>("SELECT * FROM writing_tasks ORDER BY created_at DESC");
    const tasks = rawTasks.map((t) => ({
      ...t,
      chart_data: parseJson(t.chart_data, null),
      vocabulary_assets: parseJson(t.vocabulary_assets, []),
    }));

    // 2. Students
    const students = await query<any>(
      "SELECT id, full_name, email, role, native_language, merit_score, locked_until, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC"
    );

    // 3. Appeals with student profile
    const rawAppeals = await query<any>(`
      SELECT 
        a.id, a.user_id, a.message, a.status, a.created_at,
        u.full_name as student_name, u.email as student_email, u.merit_score as student_merit, u.locked_until as student_locked_until
      FROM unlock_appeals a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.created_at DESC
    `);
    const appeals = rawAppeals.map((a) => ({
      id: a.id,
      user_id: a.user_id,
      message: a.message,
      status: a.status,
      created_at: a.created_at,
      profile: {
        id: a.user_id,
        full_name: a.student_name,
        email: a.student_email,
        merit_score: a.student_merit,
        locked_until: a.student_locked_until,
      },
    }));

    // 4. AI API Keys
    const apiKeys = await query<any>(
      "SELECT id, provider, model_name, api_key, priority, is_active, daily_usage_count, last_used_at FROM ai_api_keys ORDER BY priority ASC"
    );

    // 5. System Settings
    const rawSettings = await queryOne<any>("SELECT * FROM system_settings WHERE id = 1");
    const settings = rawSettings
      ? {
          ...rawSettings,
          creator_bio: parseJson(rawSettings.creator_bio, null),
        }
      : null;

    // 6. Submissions count today
    const submissionsToday = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM submissions WHERE created_at >= CURDATE()"
    );

    return NextResponse.json({
      success: true,
      tasks,
      students,
      appeals,
      apiKeys,
      settings,
      stats: {
        totalStudents: students.length,
        publishedTopics: tasks.filter((t) => t.status === "published").length,
        todayEvaluations: submissionsToday?.count || 0,
        pendingAppeals: appeals.length,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/admin/data GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Admin Actions (Add/Delete Keys, Publish/Delete Tasks, Save Settings)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "add_key": {
        const { provider, modelName, apiKey, priority } = body;
        if (!provider || !apiKey) {
          return NextResponse.json({ error: "Provider and API Key required" }, { status: 400 });
        }
        const id = crypto.randomUUID();
        await execute(
          `INSERT INTO ai_api_keys (id, provider, model_name, api_key, priority, is_active, daily_usage_count)
           VALUES (?, ?, ?, ?, ?, TRUE, 0)`,
          [id, provider, modelName || "default", apiKey, Number(priority) || 1]
        );
        return NextResponse.json({ success: true, keyId: id });
      }

      case "toggle_key": {
        const { keyId, isActive } = body;
        await execute("UPDATE ai_api_keys SET is_active = ? WHERE id = ?", [!!isActive, keyId]);
        return NextResponse.json({ success: true });
      }

      case "delete_key": {
        const { keyId } = body;
        await execute("DELETE FROM ai_api_keys WHERE id = ?", [keyId]);
        return NextResponse.json({ success: true });
      }

      case "publish_task": {
        const { taskId } = body;
        await execute(
          "UPDATE writing_tasks SET status = 'published', published_at = NOW() WHERE id = ?",
          [taskId]
        );
        return NextResponse.json({ success: true });
      }

      case "delete_task": {
        const { taskId } = body;
        await execute("DELETE FROM writing_tasks WHERE id = ?", [taskId]);
        return NextResponse.json({ success: true });
      }

      case "update_settings": {
        const { dailyLimit, evaluationsPaused, announcement, creatorBio } = body;
        await execute(
          `INSERT INTO system_settings (id, daily_submission_limit, ai_evaluations_paused, global_announcement, creator_bio)
           VALUES (1, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             daily_submission_limit = VALUES(daily_submission_limit),
             ai_evaluations_paused = VALUES(ai_evaluations_paused),
             global_announcement = VALUES(global_announcement),
             creator_bio = VALUES(creator_bio)`,
          [
            Number(dailyLimit) || 3,
            !!evaluationsPaused,
            announcement || null,
            creatorBio ? JSON.stringify(creatorBio) : null,
          ]
        );
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in /api/admin/data POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
