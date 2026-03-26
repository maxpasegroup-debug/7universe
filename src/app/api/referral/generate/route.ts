import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api";
import { getServerAppBaseUrl } from "@/lib/app-url";
import { isUuid } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId")?.trim() ?? "";

  if (!userId || !isUuid(userId)) {
    return badRequest("userId must be a valid UUID");
  }

  const base = getServerAppBaseUrl();
  const referralLink = `${base}?ref=${encodeURIComponent(userId)}`;

  return NextResponse.json({ referralLink });
}
