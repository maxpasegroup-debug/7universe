import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/auth/admin-session";
import { getRequestId, logApiError, serverError } from "@/lib/api";

export async function POST() {
  const requestId = getRequestId();
  try {
    const store = await cookies();
    store.set(adminCookieName(), "", {
      ...{ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
      maxAge: 0,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logApiError("admin/logout", e, requestId);
    return serverError("Could not clear session", requestId);
  }
}
