import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isValidInternationalMobile, isUuid, normalizeInternationalMobile } from "@/lib/validation";

type Body = {
  name?: string;
  mobile?: string;
  language?: string;
  referrerId?: string | null;
};

function maskE164(e164: string): string {
  const d = e164.replace(/\D/g, "");
  if (d.length <= 4) return "****";
  return `***${d.slice(-4)}`;
}

function isMissingTableError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return true;
  const msg = e instanceof Error ? e.message : String(e);
  return (
    /does not exist/i.test(msg) &&
    (/public\.users|"users"|'users'|relation.*users|\busers\b/i.test(msg) || /\btable\b/i.test(msg))
  );
}

function isConnectionFailure(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1017"].includes(e.code);
  }
  const msg = e instanceof Error ? e.message : String(e);
  return /Can't reach database|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|server closed the connection/i.test(msg);
}

function clientFacingDbMessage(e: unknown): string {
  if (isMissingTableError(e)) {
    return "Database not initialized";
  }
  if (isConnectionFailure(e)) {
    return "Database connection failed";
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "Unexpected database error";
}

async function ensureProgressForUser(userId: string, requestId: string): Promise<void> {
  try {
    const existing = await prisma.progress.findUnique({ where: { userId }, select: { id: true } });
    if (existing) {
      console.log(`[POST /api/user/create] Progress exists requestId=${requestId}`, { userId, progressId: existing.id });
      return;
    }
    const row = await prisma.progress.create({
      data: {
        userId,
        step1Completed: false,
        step2Completed: false,
        step3Completed: false,
        score: 0,
      },
    });
    console.log(`[POST /api/user/create] Progress created requestId=${requestId}`, { userId, progressId: row.id });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      console.log(`[POST /api/user/create] Progress already created (race) requestId=${requestId}`, userId);
      return;
    }
    console.error(`[POST /api/user/create] ensureProgressForUser failed requestId=${requestId}`, userId, err);
  }
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
  const referrerIdRaw = body.referrerId;

  console.log(`[POST /api/user/create] Request body requestId=${requestId}`, {
    namePreview: name.slice(0, 80),
    language,
    mobileMasked: mobile ? maskE164(mobile) : "(empty)",
    referrerPresent: referrerIdRaw != null && String(referrerIdRaw).trim() !== "",
  });

  if (!name) {
    return badRequest("Name is required", requestId);
  }
  if (!isValidInternationalMobile(mobile)) {
    return badRequest("Invalid number", requestId);
  }
  if (!language) {
    return badRequest("Language is required", requestId);
  }
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
      const msg = clientFacingDbMessage(e);
      logApiError("POST /api/user/create (referrer lookup)", e, requestId);
      console.error(`[POST /api/user/create] Referrer lookup failed requestId=${requestId}`, e);
      return serverError(msg, requestId);
    }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { mobile },
      select: { id: true },
    });

    if (existing) {
      await ensureProgressForUser(existing.id, requestId);
      console.log(`[POST /api/user/create] Duplicate mobile — success with existing user requestId=${requestId}`, {
        userId: existing.id,
      });
      return NextResponse.json({
        userId: existing.id,
        success: true,
        created: false,
      });
    }

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          mobile,
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

    console.log(`[POST /api/user/create] User created requestId=${requestId}`, { userId: user.id, created: true });

    return NextResponse.json({
      userId: user.id,
      success: true,
      created: true,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      try {
        const fallback = await prisma.user.findUnique({
          where: { mobile },
          select: { id: true },
        });
        if (fallback) {
          await ensureProgressForUser(fallback.id, requestId);
          console.log(`[POST /api/user/create] Unique race resolved requestId=${requestId}`, { userId: fallback.id });
          return NextResponse.json({
            userId: fallback.id,
            success: true,
            created: false,
          });
        }
      } catch (recoveryErr) {
        logApiError("POST /api/user/create (P2002 recovery)", recoveryErr, requestId);
        console.error(`[POST /api/user/create] P2002 recovery failed requestId=${requestId}`, recoveryErr);
        return serverError(clientFacingDbMessage(recoveryErr), requestId);
      }
    }

    const message = clientFacingDbMessage(e);
    logApiError("POST /api/user/create", e, requestId);
    console.error(`[POST /api/user/create] Error requestId=${requestId}:`, message, e);

    return serverError(message, requestId);
  }
}
