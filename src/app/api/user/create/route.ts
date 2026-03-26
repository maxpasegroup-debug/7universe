import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isLanguageCode, isValidMobile10, isUuid, normalizeMobile } from "@/lib/validation";

type Body = {
  name?: string;
  mobile?: string;
  language?: string;
  referrerId?: string | null;
};

export async function POST(request: Request) {
  const requestId = getRequestId();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body", requestId);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mobile = typeof body.mobile === "string" ? normalizeMobile(body.mobile) : "";
  const language = typeof body.language === "string" ? body.language.trim() : "";
  const referrerIdRaw = body.referrerId;

  if (!name) {
    return badRequest("Name is required", requestId);
  }
  if (!isValidMobile10(mobile)) {
    return badRequest("Mobile must be a valid 10-digit number", requestId);
  }
  if (!isLanguageCode(language)) {
    return badRequest("Language must be en, ml, or ta", requestId);
  }

  let resolvedReferrerId: string | undefined;
  if (referrerIdRaw !== undefined && referrerIdRaw !== null && String(referrerIdRaw).trim() !== "") {
    const rid = String(referrerIdRaw).trim();
    if (!isUuid(rid)) {
      return badRequest("referrerId must be a valid UUID", requestId);
    }
    const referrer = await prisma.user.findUnique({ where: { id: rid } });
    if (!referrer) {
      return notFound("Referrer not found", requestId);
    }
    resolvedReferrerId = rid;
  }

  const existing = await prisma.user.findUnique({
    where: { mobile },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({
      userId: existing.id,
      success: true,
      created: false,
    });
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          mobile,
          language,
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

    return NextResponse.json({
      userId: user.id,
      success: true,
      created: true,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const fallback = await prisma.user.findUnique({
        where: { mobile },
        select: { id: true },
      });
      if (fallback) {
        return NextResponse.json({
          userId: fallback.id,
          success: true,
          created: false,
        });
      }
    }

    logApiError("POST /api/user/create", e, requestId);
    return serverError("Could not create user. Try again later.", requestId);
  }
}
