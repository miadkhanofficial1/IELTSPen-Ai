import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, queryOne, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { DailyReflection } from "@/lib/types";

// GET: Fetch reflection for a date or list recent
export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const list = searchParams.get("list");

    if (list === "true") {
      const recent = await query<DailyReflection>(
        `SELECT * FROM daily_reflections WHERE user_id = ? ORDER BY reflection_date DESC LIMIT 30`,
        [session.userId]
      );
      return NextResponse.json({ success: true, reflections: recent });
    }

    const targetDate = dateStr || new Date().toISOString().split("T")[0];
    const reflection = await queryOne<DailyReflection>(
      `SELECT * FROM daily_reflections WHERE user_id = ? AND reflection_date = ?`,
      [session.userId, targetDate]
    );

    return NextResponse.json({
      success: true,
      reflection: reflection || null,
      date: targetDate,
    });
  } catch (error: any) {
    console.error("Error in /api/student/reflections GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Upsert reflection for date
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reflection_date, daily_goal, reflection_text } = body;

    const targetDate = reflection_date || new Date().toISOString().split("T")[0];
    const cleanGoal = daily_goal ? String(daily_goal).trim() : null;
    const cleanReflection = reflection_text ? String(reflection_text).trim() : "";

    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM daily_reflections WHERE user_id = ? AND reflection_date = ?`,
      [session.userId, targetDate]
    );

    if (existing) {
      await execute(
        `UPDATE daily_reflections 
         SET daily_goal = ?, reflection_text = ? 
         WHERE id = ?`,
        [cleanGoal, cleanReflection, existing.id]
      );

      return NextResponse.json({
        success: true,
        updated: true,
        id: existing.id,
        date: targetDate,
      });
    }

    const newId = crypto.randomUUID();
    await execute(
      `INSERT INTO daily_reflections (id, user_id, reflection_date, daily_goal, reflection_text)
       VALUES (?, ?, ?, ?, ?)`,
      [newId, session.userId, targetDate, cleanGoal, cleanReflection]
    );

    return NextResponse.json({
      success: true,
      created: true,
      id: newId,
      date: targetDate,
    });
  } catch (error: any) {
    console.error("Error in /api/student/reflections POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
