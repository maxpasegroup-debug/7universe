import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import { hashPin, isValidPin } from "@/lib/auth-pin";
import { prisma } from "@/lib/prisma";
import { isValidInternationalMobile, isUuid, normalizeInternationalMobile } from "@/lib/validation";

type Body = { name?: string; mobile?: string; language?: string; pin?: string; referrerId?: string | null };

async function ensureProgressForUser(userId: string): Promise<void> {
  const existing = await prisma.progress.findUnique({ where: { userId }, select: { id: true } });
  if (existing) return;
  await prisma.progress.create({
    data: { userId, step1Completed: false, step2Completed: false, step3Completed: false, score: 0 },
  });
}

export async function POST(request: Request) {
  const requestId = getRequestId();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error(`[POST /api/user/create] DATABASE_URL missing requestId=${requestId}`);
    return serverError("Database connection failed", requestId);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body", requestId);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mobile =
    typeof body.mobile === "string" ? normalizeInternationalMobile(body.mobile) : "";
  const language = typeof body.language === "string" ? body.language.trim() : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";
  const referrerIdRaw = body.referrerId;

  if (!name) {
    return badRequest("Name is required", requestId);
  }
  if (!isValidInternationalMobile(mobile)) {
    return badRequest("Invalid number", requestId);
  }
  if (!language) return badRequest("Language is required", requestId);
  if (!isValidPin(pin)) return badRequest("PIN must be exactly 4 digits", requestId);
  const langNorm = language.toLowerCase();
  const langRow = await prisma.language.findFirst({
    where: { code: langNorm, isActive: true },
  });
  if (!langRow) {
    return badRequest("Invalid or inactive language", requestId);
  }

  let resolvedReferrerId: string | undefined;
  if (referrerIdRaw !== undefined && referrerIdRaw !== null && String(referrerIdRaw).trim() !== "") {
    const rid = String(referrerIdRaw).trim();
    if (!isUuid(rid)) {
      return badRequest("referrerId must be a valid UUID", requestId);
    }
    try {
      const referrer = await prisma.user.findUnique({ where: { id: rid } });
      if (!referrer) {
        return notFound("Referrer not found", requestId);
      }
      resolvedReferrerId = rid;
    } catch (e) {
      logApiError("POST /api/user/create (referrer lookup)", e, requestId);
      return serverError("Could not validate referrer", requestId);
    }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { mobile },
      select: { id: true },
    });

    if (existing) {
      await ensureProgressForUser(existing.id);
      return NextResponse.json({
        userId: existing.id,
        success: true,
        created: false,
        accountExists: true,
        message: "This number already exists. Please continue with your PIN.",
      });
    }

    const pinHash = await hashPin(pin);
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          mobile,
          pinHash,
          language: langRow.code,
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
      accountExists: false,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      try {
        const fallback = await prisma.user.findUnique({
          where: { mobile },
          select: { id: true },
        });
        if (fallback) {
          await ensureProgressForUser(fallback.id);
          return NextResponse.json({
            userId: fallback.id,
            success: true,
            created: false,
            accountExists: true,
            message: "This number already exists. Please continue with your PIN.",
          });
        }
      } catch (recoveryErr) {
        logApiError("POST /api/user/create (P2002 recovery)", recoveryErr, requestId);
        return serverError("Could not create account", requestId);
      }
    }
    logApiError("POST /api/user/create", e, requestId);
    return serverError("Could not create account", requestId);
  }
}
