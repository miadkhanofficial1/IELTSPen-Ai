import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wordId, rating } = await request.json();

    if (!wordId || !rating) {
      return NextResponse.json(
        { error: "wordId and rating ('again'|'hard'|'good'|'easy') are required." },
        { status: 400 }
      );
    }

    const word = await queryOne<{ id: string; mastery_level: number }>(
      `SELECT id, mastery_level FROM saved_vocabulary WHERE id = ? AND user_id = ?`,
      [wordId, session.userId]
    );

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    let newMastery = Number(word.mastery_level || 1);
    let intervalHours = 24;

    switch (rating) {
      case "again":
        newMastery = 1;
        intervalHours = 1; // 1 hour for quick review
        break;
      case "hard":
        newMastery = Math.min(5, Math.max(1, newMastery));
        intervalHours = 24; // 1 day
        break;
      case "good":
        newMastery = Math.min(5, newMastery + 1);
        intervalHours = 72; // 3 days
        break;
      case "easy":
        newMastery = Math.min(5, newMastery + 2);
        intervalHours = 168; // 7 days
        break;
      default:
        intervalHours = 24;
    }

    const nextReviewDate = new Date(Date.now() + intervalHours * 3600 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await execute(
      `UPDATE saved_vocabulary 
       SET mastery_level = ?, next_review_at = ? 
       WHERE id = ? AND user_id = ?`,
      [newMastery, nextReviewDate, wordId, session.userId]
    );

    return NextResponse.json({
      success: true,
      wordId,
      newMastery,
      nextReviewAt: nextReviewDate,
    });
  } catch (error: any) {
    console.error("Error in /api/student/vocabulary/review POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
