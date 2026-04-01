import { SignJWT, jwtVerify } from "jose";

const COOKIE = "7u_user_session";

type SessionPayload = {
  sub: string;
  mobile: string;
};

function getSecret(): Uint8Array {
  const s = process.env.USER_JWT_SECRET ?? process.env.ADMIN_JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("USER_JWT_SECRET must be set (min 16 chars)");
  }
  return new TextEncoder().encode(s);
}

export async function createUserSessionToken(userId: string, mobile: string): Promise<string> {
  return new SignJWT({ mobile })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyUserSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const out = await jwtVerify(token, getSecret());
    const sub = out.payload.sub;
    const mobile = typeof out.payload.mobile === "string" ? out.payload.mobile : "";
    if (!sub || !mobile) return null;
    return { sub, mobile };
  } catch {
    return null;
  }
}

export function userCookieName(): string {
  return COOKIE;
}

export function userCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
