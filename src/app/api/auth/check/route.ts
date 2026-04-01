import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isValidInternationalMobile, normalizeInternationalMobile } from "@/lib/validation";

type Body = { mobile?: string };

export async function POST(request: Request) {
  const requestId = getRequestId();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body", requestId);
  }

  const mobile = typeof body.mobile === "string" ? normalizeInternationalMobile(body.mobile) : "";
  if (!isValidInternationalMobile(mobile)) {
    return badRequest("Invalid number", requestId);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobile },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, accountExists: false, mobile });
    }

    return NextResponse.json({
      success: true,
      accountExists: true,
      message: "This number already exists. Please continue with your PIN.",
      hasPin: true,
    });
  } catch (e) {
    logApiError("POST /api/auth/check", e, requestId);
    return serverError("Could not check mobile number", requestId);
  }
}
