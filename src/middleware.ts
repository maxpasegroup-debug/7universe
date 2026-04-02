import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminCookieName } from "@/lib/auth/admin-session";

type Bucket = { count: number; resetAt: number };
const RATE_LIMITED_PATHS = new Set([
  "/api/user/create",
  "/api/user/progress",
  "/api/admin/login",
  "/api/auth/check",
  "/api/auth/register",
  "/api/auth/login",
]);
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

function readIp(req: NextRequest): string {
  const xfwd = req.headers.get("x-forwarded-for");
  return xfwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function passRateLimit(req: NextRequest): boolean {
  const key = `${readIp(req)}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const g = globalThis as typeof globalThis & { __rateLimitStore?: Map<string, Bucket> };
  if (!g.__rateLimitStore) g.__rateLimitStore = new Map<string, Bucket>();
  const store = g.__rateLimitStore;

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_PER_WINDOW) return false;
  existing.count += 1;
  store.set(key, existing);
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") && RATE_LIMITED_PATHS.has(pathname)) {
    if (!passRateLimit(request)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const token = request.cookies.get(adminCookieName())?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const removedAdminUi = new Set([
    "/admin/languages",
    "/admin/content",
    "/admin/materials",
    "/admin/steps",
    "/admin/legacy-settings",
  ]);
  if (removedAdminUi.has(pathname)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
