import { NextResponse } from "next/server";
import { userCookieName } from "@/lib/auth/user-session";

export async function POST() {
  const res = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(userCookieName(), "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure,
  });
  return res;
}
