import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/auth/admin-session";

export async function POST() {
  const store = await cookies();
  store.set(adminCookieName(), "", { ...{ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" }, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
