import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const AUTH_COOKIE_NAME = "ieltspen_token";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "ieltspen-ai-jwt-super-secret-key-production-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface AuthUserPayload {
  userId: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
  nativeLanguage?: string;
}

/**
 * Sign a JWT token (Edge Runtime compatible)
 */
export async function createToken(payload: AuthUserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token (Edge Runtime compatible)
 */
export async function verifyToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthUserPayload;
  } catch {
    return null;
  }
}
