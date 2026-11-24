import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  createToken,
  verifyToken,
  AUTH_COOKIE_NAME,
  AuthUserPayload,
} from "./token";

export {
  createToken,
  verifyToken,
  AUTH_COOKIE_NAME,
  type AuthUserPayload,
};

/**
 * Password hashing using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Read and verify session from Server Component / Route Handler cookies
 */
export async function getServerSession(): Promise<AuthUserPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Read and verify session from Request (Edge Middleware / Route Handler)
 */
export async function getSessionFromRequest(req: NextRequest): Promise<AuthUserPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

/**
 * Set HttpOnly Auth Cookie on NextResponse
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear Auth Cookie on NextResponse
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
