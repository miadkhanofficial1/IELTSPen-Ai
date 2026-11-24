import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await queryOne<{
      id: string;
      merit_score: number;
      locked_until: string | null;
      native_language: string;
    }>(
      "SELECT id, merit_score, locked_until, native_language FROM users WHERE id = ?",
      [session.userId]
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for pending appeal
    const pendingAppeal = await queryOne<{ id: string; message: string; created_at: string }>(
      "SELECT id, message, created_at FROM unlock_appeals WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
      [session.userId]
    );

    // Check system announcement
    const settings = await queryOne<{ global_announcement: string | null }>(
      "SELECT global_announcement FROM system_settings WHERE id = 1"
    );

    const isLocked =
      user.locked_until && new Date(user.locked_until).getTime() > Date.now();

    return NextResponse.json({
      success: true,
      meritScore: user.merit_score,
      lockedUntil: user.locked_until,
      isLocked,
      hasPendingAppeal: !!pendingAppeal,
      pendingAppeal,
      nativeLanguage: user.native_language,
      globalAnnouncement: settings?.global_announcement || null,
    });
  } catch (error: any) {
    console.error("Error in /api/student/status:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch status" }, { status: 500 });
  }
}
