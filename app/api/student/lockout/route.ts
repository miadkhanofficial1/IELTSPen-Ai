import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { execute, queryOne } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, essayText = "", wordCount = 0, tabViolations = 3 } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const submissionId = crypto.randomUUID();

    // 1. Record failed_cheat submission
    await execute(
      `INSERT INTO submissions (
        id, user_id, task_id, student_essay, word_count, time_spent_seconds, 
        paste_count, tab_switch_count, overall_band, criteria_scores, corrections,
        examiner_feedback, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        session.userId,
        taskId,
        essayText || "[Test terminated for tab switching violations]",
        wordCount,
        0,
        0,
        tabViolations,
        0.0,
        JSON.stringify({ task_achievement: 0, coherence: 0, lexical: 0, grammar: 0 }),
        JSON.stringify([]),
        "Test terminated immediately due to multiple tab-switching and window focus violations (Anti-Cheat 3-Strike Rule).",
        "failed_cheat",
      ]
    );

    // 2. Deduct 10 merit points and lock account for 15 minutes
    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const user = await queryOne<{ merit_score: number }>(
      "SELECT merit_score FROM users WHERE id = ?",
      [session.userId]
    );

    const currentMerit = user?.merit_score ?? 100;
    const newMerit = Math.max(0, currentMerit - 10);

    await execute(
      "UPDATE users SET merit_score = ?, locked_until = ? WHERE id = ?",
      [newMerit, lockExpiry, session.userId]
    );

    return NextResponse.json({
      success: true,
      submissionId,
      meritScore: newMerit,
      lockedUntil: lockExpiry,
    });
  } catch (error: any) {
    console.error("Lockout record error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process lockdown penalty" },
      { status: 500 }
    );
  }
}
