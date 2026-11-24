import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, execute, queryOne } from "@/lib/db";

// GET: Admin retrieves all appeals with joined user info
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appeals = await query<any>(`
      SELECT 
        a.id,
        a.user_id,
        a.message,
        a.status,
        a.created_at,
        u.full_name as user_name,
        u.email as user_email,
        u.merit_score as user_merit,
        u.locked_until as user_locked_until
      FROM unlock_appeals a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY 
        CASE WHEN a.status = 'pending' THEN 0 ELSE 1 END,
        a.created_at DESC
      LIMIT 100
    `);

    const pendingCount = appeals.filter((a) => a.status === "pending").length;

    return NextResponse.json({
      success: true,
      pendingCount,
      appeals,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/appeals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Student submits an unlock appeal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Appeal message cannot be empty." }, { status: 400 });
    }

    if (message.length > 200) {
      return NextResponse.json({ error: "Appeal message must be 200 characters or fewer." }, { status: 400 });
    }

    // Check if pending appeal already exists
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM unlock_appeals WHERE user_id = ? AND status = 'pending'",
      [session.userId]
    );

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending unlock appeal awaiting review." },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO unlock_appeals (id, user_id, message, status) VALUES (?, ?, ?, 'pending')",
      [id, session.userId, message]
    );

    return NextResponse.json({ success: true, appealId: id, message: "Appeal submitted successfully." });
  } catch (error: any) {
    console.error("Error submitting appeal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
