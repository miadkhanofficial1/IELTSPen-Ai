import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const AUTH_COOKIE_NAME = "ieltspen_token";

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || "IELTSPenSuperSecretJWTKey2026";
  return new TextEncoder().encode(secret);
}

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
    .sign(getJwtSecret());
}

/**
 * Verify a JWT token (Edge Runtime compatible)
 */
export async function verifyToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as AuthUserPayload;
  } catch {
    return null;
  }
}
