import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

const ADMIN_EMAIL = "miadkhan.official1@gmail.com";

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Look up user in TiDB
    const user = await queryOne<{
      id: string;
      full_name: string;
      email: string;
      password_hash: string;
      role: "student" | "admin";
      native_language: string;
    }>("SELECT id, full_name, email, password_hash, role, native_language FROM users WHERE email = ?", [email]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    let role = user.role;
    // Auto-promote founder email to admin
    if (email === ADMIN_EMAIL && role !== "admin") {
      await execute("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
      role = "admin";
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role,
      nativeLanguage: user.native_language,
    });

    const redirectUrl = role === "admin" ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role,
        nativeLanguage: user.native_language,
      },
      redirectUrl,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sign in. Please try again." },
      { status: 500 }
    );
  }
}
