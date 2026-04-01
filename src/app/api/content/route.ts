import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Legacy content API disabled. Use /api/onboarding/journey." },
    { status: 410 },
  );
}
