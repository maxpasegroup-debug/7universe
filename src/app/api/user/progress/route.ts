import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const STEP_POINTS: Record<1 | 2 | 3, number> = {
  1: 10,
  2: 15,
  3: 20,
};

function parseStep(v: unknown): 1 | 2 | 3 | null {
  if (v === 1 || v === 2 || v === 3) return v;
  if (typeof v === "string") {
    const n = Number.parseInt(v, 10);
    if (n === 1 || n === 2 || n === 3) return n as 1 | 2 | 3;
  }
  return null;
}

type Body = {
  userId?: string;
  step?: unknown;
};

export async function GET(request: Request) {
  const requestId = getRequestId();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId")?.trim() ?? "";

  if (!userId || !isUuid(userId)) {
    return badRequest("userId must be a valid UUID", requestId);
  }

  try {
    const progress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (!progress) {
      return notFound("Progress not found for this user", requestId);
    }

    const referralCount = await prisma.referral.count({
      where: { referrerId: userId },
    });

    return NextResponse.json({
      progress: {
        id: progress.id,
        userId: progress.userId,
        step1Completed: progress.step1Completed,
        step2Completed: progress.step2Completed,
        step3Completed: progress.step3Completed,
        score: progress.score,
      },
      referralCount,
    });
  } catch (e) {
    logApiError("GET /api/user/progress", e, requestId);
    return serverError("Could not load progress", requestId);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body", requestId);
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const step = parseStep(body.step);

  if (!userId || !isUuid(userId)) {
    return badRequest("userId must be a valid UUID", requestId);
  }
  if (step === null) {
    return badRequest("step must be 1, 2, or 3", requestId);
  }

  try {
    const current = await prisma.progress.findUnique({
      where: { userId },
    });

    if (!current) {
      return notFound("Progress not found for this user", requestId);
    }

    const key = step === 1 ? "step1Completed" : step === 2 ? "step2Completed" : "step3Completed";
    const alreadyDone = current[key];
    const points = alreadyDone ? 0 : STEP_POINTS[step];

    const updated = await prisma.progress.update({
      where: { userId },
      data: {
        [key]: true,
        score: { increment: points },
      },
    });

    return NextResponse.json({
      progress: {
        id: updated.id,
        userId: updated.userId,
        step1Completed: updated.step1Completed,
        step2Completed: updated.step2Completed,
        step3Completed: updated.step3Completed,
        score: updated.score,
      },
    });
  } catch (e) {
    logApiError("POST /api/user/progress", e, requestId);
    return serverError("Could not update progress", requestId);
  }
}
