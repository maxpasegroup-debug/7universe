import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth/require-admin";

export async function POST(request: Request) {
  void request;
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    {
      error:
        "Direct file upload is disabled in Prisma-only mode. Use URL fields in CMS Materials/Settings.",
    },
    { status: 410 },
  );
}
