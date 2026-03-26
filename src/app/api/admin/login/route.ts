import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, createAdminSessionToken } from "@/lib/auth/admin-session";
import { badRequest, getRequestId, logApiError, serverError } from "@/lib/api";

function safeEqual(a: string, b: string): boolean {
  try {
    const x = Buffer.from(a, "utf8");
    const y = Buffer.from(b, "utf8");
    if (x.length !== y.length) return false;
    return timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  const requestId = getRequestId();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON", requestId);
  }

  const password = typeof body.password === "string" ? body.password : "";

  const adminPass = process.env.ADMIN_PASSWORD ?? "";

  if (!adminPass) {
    return NextResponse.json({ error: "Admin login not configured" }, { status: 503 });
  }

  if (!safeEqual(password, adminPass)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    const token = await createAdminSessionToken();
    const store = await cookies();
    store.set(adminCookieName(), token, adminCookieOptions());
    return NextResponse.json({ ok: true });
  } catch (e) {
    logApiError("admin/login", e, requestId);
    return serverError("Could not create session", requestId);
  }
}
