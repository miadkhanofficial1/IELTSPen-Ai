import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, queryOne, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { SavedVocabularyItem } from "@/lib/types";

// GET: Fetch saved vocabulary for current user
export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let sql = `SELECT * FROM saved_vocabulary WHERE user_id = ?`;
    const params: any[] = [session.userId];

    if (category && category !== "all") {
      sql += ` AND topic_category = ?`;
      params.push(category);
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(word) LIKE ? OR LOWER(meaning_en) LIKE ?)`;
      params.push(`%${search.trim().toLowerCase()}%`, `%${search.trim().toLowerCase()}%`);
    }

    sql += ` ORDER BY next_review_at ASC, created_at DESC`;

    const words = await query<SavedVocabularyItem>(sql, params);

    // Compute category counts
    const categoryCountsRaw = await query<{ topic_category: string; count: number }>(
      `SELECT topic_category, COUNT(*) as count FROM saved_vocabulary WHERE user_id = ? GROUP BY topic_category`,
      [session.userId]
    );

    const categoryCounts: Record<string, number> = {};
    categoryCountsRaw.forEach((c) => {
      categoryCounts[c.topic_category] = Number(c.count);
    });

    // Compute mastery statistics
    const masteryStatsRaw = await query<{ mastery_level: number; count: number }>(
      `SELECT mastery_level, COUNT(*) as count FROM saved_vocabulary WHERE user_id = ? GROUP BY mastery_level`,
      [session.userId]
    );

    const masteryStats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    masteryStatsRaw.forEach((m) => {
      masteryStats[Number(m.mastery_level)] = Number(m.count);
    });

    // Due for review count
    const dueCountRow = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM saved_vocabulary WHERE user_id = ? AND next_review_at <= NOW()`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      words: words || [],
      categoryCounts,
      masteryStats,
      dueCount: Number(dueCountRow?.count || 0),
    });
  } catch (error: any) {
    console.error("Error in /api/student/vocabulary GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save a new word (manual entry or one-click saver)
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { word, meaning_en, meaning_native, example_sentence, topic_category } = body;

    if (!word || !meaning_en) {
      return NextResponse.json(
        { error: "Word and English meaning are required." },
        { status: 400 }
      );
    }

    const cleanWord = String(word).trim();
    const cleanMeaningEn = String(meaning_en).trim();
    const cleanMeaningNative = meaning_native ? String(meaning_native).trim() : null;
    const cleanExample = example_sentence ? String(example_sentence).trim() : null;
    const cleanCategory = topic_category ? String(topic_category).trim() : "General Academic";

    // Check if word already saved by this user
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM saved_vocabulary WHERE user_id = ? AND LOWER(word) = LOWER(?)`,
      [session.userId, cleanWord]
    );

    if (existing) {
      // Update existing word
      await execute(
        `UPDATE saved_vocabulary 
         SET meaning_en = ?, meaning_native = COALESCE(?, meaning_native),
             example_sentence = COALESCE(?, example_sentence), topic_category = ?
         WHERE id = ?`,
        [cleanMeaningEn, cleanMeaningNative, cleanExample, cleanCategory, existing.id]
      );

      return NextResponse.json({
        success: true,
        updated: true,
        id: existing.id,
        word: cleanWord,
      });
    }

    // Insert new word
    const newId = crypto.randomUUID();
    await execute(
      `INSERT INTO saved_vocabulary (id, user_id, word, meaning_en, meaning_native, example_sentence, topic_category, mastery_level, next_review_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [newId, session.userId, cleanWord, cleanMeaningEn, cleanMeaningNative, cleanExample, cleanCategory]
    );

    return NextResponse.json({
      success: true,
      created: true,
      id: newId,
      word: cleanWord,
    });
  } catch (error: any) {
    console.error("Error in /api/student/vocabulary POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove word from saved list
export async function DELETE(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    await execute(`DELETE FROM saved_vocabulary WHERE id = ? AND user_id = ?`, [
      id,
      session.userId,
    ]);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Error in /api/student/vocabulary DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
