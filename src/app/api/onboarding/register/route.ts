import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { success: false, error: "Legacy onboarding API disabled. Use /api/auth/register." },
    { status: 410 },
  );
}
