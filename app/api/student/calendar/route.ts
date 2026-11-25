import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { StudyEvent } from "@/lib/types";

// GET: Fetch user's study events for month / date range
export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month"); // 1-12

    let sql = `SELECT * FROM study_events WHERE user_id = ?`;
    const params: any[] = [session.userId];

    if (year && month) {
      const paddedMonth = String(month).padStart(2, "0");
      const start = `${year}-${paddedMonth}-01`;
      const end = `${year}-${paddedMonth}-31`;
      sql += ` AND event_date BETWEEN ? AND ?`;
      params.push(start, end);
    }

    sql += ` ORDER BY event_date ASC, start_time ASC`;

    const rawEvents = await query<any>(sql, params);
    const events: StudyEvent[] = rawEvents.map((e) => ({
      ...e,
      is_completed: Boolean(e.is_completed),
    }));

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("Error in /api/student/calendar GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new study event
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, event_date, start_time, end_time } = body;

    if (!title || !event_date) {
      return NextResponse.json(
        { error: "Title and event_date are required." },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    const cleanCategory = ["Study", "Exam Date", "To-do", "Goals"].includes(category)
      ? category
      : "Study";

    await execute(
      `INSERT INTO study_events (id, user_id, title, category, event_date, start_time, end_time, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        newId,
        session.userId,
        String(title).trim(),
        cleanCategory,
        event_date,
        start_time ? String(start_time).trim() : null,
        end_time ? String(end_time).trim() : null,
      ]
    );

    return NextResponse.json({
      success: true,
      event: {
        id: newId,
        user_id: session.userId,
        title: String(title).trim(),
        category: cleanCategory,
        event_date,
        start_time,
        end_time,
        is_completed: false,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/student/calendar POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Toggle is_completed
export async function PATCH(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, is_completed } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const completed = is_completed ? 1 : 0;
    await execute(
      `UPDATE study_events SET is_completed = ? WHERE id = ? AND user_id = ?`,
      [completed, id, session.userId]
    );

    return NextResponse.json({ success: true, id, is_completed: Boolean(completed) });
  } catch (error: any) {
    console.error("Error in /api/student/calendar PATCH:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a study event
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
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    await execute(`DELETE FROM study_events WHERE id = ? AND user_id = ?`, [
      id,
      session.userId,
    ]);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Error in /api/student/calendar DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
