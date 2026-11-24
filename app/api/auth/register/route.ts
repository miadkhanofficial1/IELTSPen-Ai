import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { queryOne, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

const ADMIN_EMAIL = "miadkhan.official1@gmail.com";

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const nativeLanguage = (body.nativeLanguage || "English").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Automatically elevate founder email to admin
    const role: "student" | "admin" =
      email === ADMIN_EMAIL ? "admin" : "student";

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await execute(
      `INSERT INTO users (id, full_name, email, password_hash, role, native_language, merit_score)
       VALUES (?, ?, ?, ?, ?, ?, 100)`,
      [userId, fullName || (role === "admin" ? "MD. MIAD IBNA NOOR" : "Student"), email, passwordHash, role, nativeLanguage]
    );

    const token = await createToken({
      userId,
      email,
      fullName: fullName || (role === "admin" ? "MD. MIAD IBNA NOOR" : "Student"),
      role,
      nativeLanguage,
    });

    const redirectUrl = role === "admin" ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        fullName,
        role,
        nativeLanguage,
      },
      redirectUrl,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
