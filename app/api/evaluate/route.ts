import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { evaluateIELTSEssay, harvestAndSaveStudyAssets } from "@/lib/ai-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, taskType, promptText, essayText, nativeLanguage, cheatTermination, tabViolations } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Missing required task ID" },
        { status: 400 }
      );
    }

    // Handle anti-cheat 3-strike termination without calling AI
    if (cheatTermination) {
      const submissionId = crypto.randomUUID();
      await execute(
        `INSERT INTO submissions (id, user_id, task_id, essay_text, word_count, status, tab_violations, created_at)
         VALUES (?, ?, ?, ?, ?, 'failed_cheat', ?, NOW())`,
        [submissionId, session.userId, taskId, essayText || "", (essayText || "").trim().split(/\s+/).filter(Boolean).length, tabViolations || 3]
      );

      // Deduct 10 merit points and apply 15-minute lock
      await execute(
        `UPDATE users 
         SET merit_score = GREATEST(0, merit_score - 10),
             locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
         WHERE id = ?`,
        [session.userId]
      );

      return NextResponse.json({
        success: true,
        terminated: true,
        message: "Test terminated due to anti-cheat violation. Locked for 15 minutes.",
      });
    }

    if (!essayText) {
      return NextResponse.json(
        { error: "Essay content cannot be empty." },
        { status: 400 }
      );
    }

    // 1. Check system settings: AI evaluations paused & daily submission limit
    const settings = await queryOne<{
      ai_evaluations_paused: boolean | number;
      daily_submission_limit: number;
    }>("SELECT ai_evaluations_paused, daily_submission_limit FROM system_settings WHERE id = 1");

    if (settings?.ai_evaluations_paused) {
      return NextResponse.json(
        {
          error:
            "AI evaluations are temporarily paused for routine examiner model updates. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    // Check daily submission limit
    const todayResult = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND status = 'completed' AND created_at >= CURDATE()",
      [session.userId]
    );

    const limit = settings?.daily_submission_limit ?? 3;
    if ((todayResult?.count ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: `Daily submission limit of ${limit} tests reached. You can practice again tomorrow.`,
        },
        { status: 429 }
      );
    }

    // 2. Perform AI IELTS Evaluation
    const evaluation = await evaluateIELTSEssay({
      taskType: taskType || "task_2",
      promptText: promptText || "",
      essayText,
      nativeLanguage: nativeLanguage || session.nativeLanguage || "English",
    });

    // 3. Save completed submission to TiDB
    const submissionId = crypto.randomUUID();
    await execute(
      `INSERT INTO submissions (id, user_id, task_id, essay_text, word_count, status, tab_violations, overall_band, criteria_scores, corrections, created_at)
       VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, NOW())`,
      [
        submissionId,
        session.userId,
        taskId,
        essayText,
        evaluation.word_count,
        tabViolations || 0,
        evaluation.overall_band,
        JSON.stringify(evaluation.criteria_scores),
        JSON.stringify(evaluation.corrections),
      ]
    );

    // 4. Auto-Harvest & Deduplicate Study Takeaways (Vocabulary, Grammar, Tricks) into student_study_assets
    try {
      await harvestAndSaveStudyAssets({
        userId: session.userId,
        taskId,
        submissionId,
        takeaways: evaluation.study_takeaways,
        corrections: evaluation.corrections,
        nativeLanguage: nativeLanguage || session.nativeLanguage || "English",
      });
    } catch (harvestErr) {
      console.warn("Notice: Failed to auto-harvest study assets:", harvestErr);
    }

    return NextResponse.json({
      success: true,
      submissionId,
      evaluation,
    });
  } catch (err: any) {
    console.error("Evaluation API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete evaluation." },
      { status: 500 }
    );
  }
}
