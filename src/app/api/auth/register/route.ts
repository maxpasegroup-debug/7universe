import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import { createUserSessionToken, userCookieName, userCookieOptions } from "@/lib/auth/user-session";
import { hashPin, isValidPin } from "@/lib/auth-pin";
import { resolveSignupLanguageCode } from "@/lib/language";
import { prisma } from "@/lib/prisma";
import { isUuid, isValidInternationalMobile, normalizeInternationalMobile } from "@/lib/validation";

type Body = {
  name?: string;
  mobile?: string;
  language?: string;
  pin?: string;
  referrerId?: string | null;
};

async function ensureProgress(userId: string) {
  const existing = await prisma.progress.findUnique({ where: { userId }, select: { id: true } });
  if (existing) return;
  await prisma.progress.create({
    data: {
      userId,
      step1Completed: false,
      step2Completed: false,
      step3Completed: false,
      score: 0,
    },
  });
}

export async function POST(request: Request) {
  const requestId = getRequestId();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body", requestId);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mobile = typeof body.mobile === "string" ? normalizeInternationalMobile(body.mobile) : "";
  const language = typeof body.language === "string" ? body.language.trim().toLowerCase() : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  if (!name) return badRequest("Name is required", requestId);
  if (!isValidInternationalMobile(mobile)) return badRequest("Invalid number", requestId);
  if (!isValidPin(pin)) return badRequest("PIN must be exactly 4 digits", requestId);

  let resolvedReferrerId: string | undefined;
  if (body.referrerId !== undefined && body.referrerId !== null && String(body.referrerId).trim()) {
    const rid = String(body.referrerId).trim();
    if (!isUuid(rid)) return badRequest("referrerId must be a valid UUID", requestId);
    const referrer = await prisma.user.findUnique({ where: { id: rid }, select: { id: true } });
    if (!referrer) return notFound("Referrer not found", requestId);
    resolvedReferrerId = rid;
  }

  const resolvedLanguageCode = await resolveSignupLanguageCode(language, { requestId });

  try {
    const existing = await prisma.user.findUnique({
      where: { mobile },
      select: { id: true, name: true, mobile: true, language: true, pinHash: true },
    });
    if (existing) {
      await ensureProgress(existing.id);
      return NextResponse.json({
        success: true,
        accountExists: true,
        created: false,
        message: "This number already exists. Please continue with your PIN.",
        userId: existing.id,
        user: {
          id: existing.id,
          name: existing.name,
          mobile: existing.mobile,
          language: existing.language,
        },
      });
    }

    const pinHash = await hashPin(pin);
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          mobile,
          pinHash,
          language: resolvedLanguageCode,
        },
      });
      await tx.progress.create({
        data: {
          userId: u.id,
          step1Completed: false,
          step2Completed: false,
          step3Completed: false,
          score: 0,
        },
      });
      if (resolvedReferrerId) {
        await tx.referral.create({
          data: {
            userId: u.id,
            referrerId: resolvedReferrerId,
          },
        });
      }
      return u;
    });

    const res = NextResponse.json({
      success: true,
      accountExists: false,
      created: true,
      userId: user.id,
      user: { id: user.id, name: user.name, mobile: user.mobile, language: user.language },
    });
    const token = await createUserSessionToken(user.id, user.mobile);
    res.cookies.set(userCookieName(), token, userCookieOptions());
    return res;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const existing = await prisma.user.findUnique({
        where: { mobile },
        select: { id: true, name: true, mobile: true, language: true },
      });
      if (existing) {
        await ensureProgress(existing.id);
        return NextResponse.json({
          success: true,
          accountExists: true,
          created: false,
          message: "This number already exists. Please continue with your PIN.",
          userId: existing.id,
          user: existing,
        });
      }
    }
    logApiError("POST /api/auth/register", e, requestId);
    return serverError("Could not register", requestId);
  }
}
