import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { createUserSessionToken, userCookieName, userCookieOptions } from "@/lib/auth/user-session";
import { isValidPin, verifyPin } from "@/lib/auth-pin";
import { prisma } from "@/lib/prisma";
import { isValidInternationalMobile, normalizeInternationalMobile } from "@/lib/validation";

type Body = { mobile?: string; pin?: string };

export async function POST(request: Request) {
  const requestId = getRequestId();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body", requestId);
  }

  const mobile = typeof body.mobile === "string" ? normalizeInternationalMobile(body.mobile) : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  if (!isValidInternationalMobile(mobile)) return badRequest("Invalid number", requestId);
  if (!isValidPin(pin)) return badRequest("PIN must be exactly 4 digits", requestId);

  try {
    const user = await prisma.user.findUnique({
      where: { mobile },
      select: { id: true, name: true, mobile: true, language: true, pinHash: true },
    });
    if (!user) return unauthorized("Account not found", requestId);
    if (!user.pinHash) return unauthorized("PIN is not set for this account", requestId);

    const ok = await verifyPin(pin, user.pinHash);
    if (!ok) return unauthorized("Invalid PIN", requestId);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        language: user.language,
      },
    });
    const token = await createUserSessionToken(user.id, user.mobile);
    res.cookies.set(userCookieName(), token, userCookieOptions());
    return res;
  } catch (e) {
    logApiError("POST /api/auth/login", e, requestId);
    return serverError("Login failed", requestId);
  }
}
