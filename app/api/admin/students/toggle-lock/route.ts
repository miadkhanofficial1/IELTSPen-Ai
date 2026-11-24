import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { studentId, shouldLock } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    if (shouldLock) {
      await execute(
        "UPDATE users SET locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?",
        [studentId]
      );
    } else {
      await execute("UPDATE users SET locked_until = NULL WHERE id = ?", [studentId]);
    }

    return NextResponse.json({
      success: true,
      studentId,
      locked: !!shouldLock,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to toggle student lock" },
      { status: 500 }
    );
  }
}
