import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api";
import { userCookieName, verifyUserSessionToken } from "@/lib/auth/user-session";
import { SAFEPAL_REFERRAL_URL } from "@/lib/constants";
import { isUuid } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId")?.trim() ?? "";

  if (!userId || !isUuid(userId)) {
    return badRequest("userId must be a valid UUID");
  }
  const cookie = request.headers.get("cookie") ?? "";
  const pair = cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${userCookieName()}=`));
  if (!pair) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const token = decodeURIComponent(pair.split("=").slice(1).join("="));
  const payload = await verifyUserSessionToken(token);
  if (!payload || payload.sub !== userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ referralLink: SAFEPAL_REFERRAL_URL });
}
