import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { appealId, studentId, action } = await request.json();

    if (!appealId || !studentId || !action) {
      return NextResponse.json(
        { error: "appealId, studentId, and action are required" },
        { status: 400 }
      );
    }

    if (action === "approved_restored") {
      // 1. Unlock student & restore +10 merit score (up to 100)
      await execute(
        "UPDATE users SET locked_until = NULL, merit_score = LEAST(100, merit_score + 10) WHERE id = ?",
        [studentId]
      );

      // 2. Mark appeal approved_restored
      await execute(
        "UPDATE unlock_appeals SET status = 'approved_restored' WHERE id = ?",
        [appealId]
      );
    } else if (action === "approved_only") {
      // Unlock student without restoring merit points
      await execute("UPDATE users SET locked_until = NULL WHERE id = ?", [studentId]);
      await execute("UPDATE unlock_appeals SET status = 'approved_only' WHERE id = ?", [appealId]);
    } else if (action === "dismissed") {
      // Dismiss appeal
      await execute("UPDATE unlock_appeals SET status = 'dismissed' WHERE id = ?", [appealId]);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      appealId,
    });
  } catch (err: any) {
    console.error("Resolve appeal error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to resolve appeal" },
      { status: 500 }
    );
  }
}
