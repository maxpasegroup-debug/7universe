import { NextResponse } from "next/server";

export async function GET(request: Request) {
  void request;
  return NextResponse.json(
    { success: false, error: "Legacy onboarding API disabled. Use /api/user/progress." },
    { status: 410 },
  );
}

export async function PATCH(request: Request) {
  void request;
  return NextResponse.json(
    { success: false, error: "Legacy onboarding API disabled. Use /api/user/progress." },
    { status: 410 },
  );
}
