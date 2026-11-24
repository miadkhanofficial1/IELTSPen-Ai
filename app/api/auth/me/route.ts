import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Fetch fresh user data from database
    const user = await queryOne<{
      id: string;
      full_name: string;
      email: string;
      role: "student" | "admin";
      native_language: string;
      merit_score: number;
      locked_until: string | null;
    }>(
      "SELECT id, full_name, email, role, native_language, merit_score, locked_until FROM users WHERE id = ?",
      [session.userId]
    );

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        nativeLanguage: user.native_language,
        meritScore: user.merit_score,
        lockedUntil: user.locked_until,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
