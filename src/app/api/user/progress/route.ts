import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import {
  completableSteps,
  computeLegacyStepFlags,
  loadJourneyWithLanguage,
  pointsForCompletableIndex,
} from "@/lib/cms/journey";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

function parseLegacyStep(v: unknown): 1 | 2 | 3 | null {
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
  stepId?: string;
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
        completedStepIds: progress.completedStepIds,
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
  let stepId = typeof body.stepId === "string" ? body.stepId.trim() : "";

  if (!userId || !isUuid(userId)) {
    return badRequest("userId must be a valid UUID", requestId);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
    if (!user) {
      return notFound("User not found", requestId);
    }

    const journey = await loadJourneyWithLanguage(user.language);
    if (!journey || journey.steps.length === 0) {
      return badRequest("Onboarding is not configured for your language", requestId);
    }

    const ordered = journey.steps.sort((a, b) => a.sortOrder - b.sortOrder);
    const stepIds = new Set(ordered.map((s) => s.id));

    if (!stepId) {
      const legacy = parseLegacyStep(body.step);
      if (legacy === null) {
        return badRequest("stepId or step (1–3) is required", requestId);
      }
      const comp = completableSteps(ordered.map((s) => ({ id: s.id, kind: s.kind })));
      const target = comp[legacy - 1];
      if (!target) {
        return badRequest("Invalid step index for this journey", requestId);
      }
      stepId = target.id;
    }

    if (!isUuid(stepId) || !stepIds.has(stepId)) {
      return badRequest("Invalid stepId", requestId);
    }

    const targetStep = ordered.find((s) => s.id === stepId)!;
    if (targetStep.kind === "action") {
      return badRequest("This step cannot be marked complete", requestId);
    }

    const current = await prisma.progress.findUnique({
      where: { userId },
    });

    if (!current) {
      return notFound("Progress not found for this user", requestId);
    }

    const done = new Set(current.completedStepIds);
    const already = done.has(stepId);
    const compOrdered = completableSteps(ordered.map((s) => ({ id: s.id, kind: s.kind })));
    const compIndex = compOrdered.findIndex((s) => s.id === stepId);
    const points = !already && compIndex >= 0 ? pointsForCompletableIndex(compIndex) : 0;

    if (!already) {
      done.add(stepId);
    }

    const flags = computeLegacyStepFlags(
      ordered.map((s) => ({ id: s.id, kind: s.kind })),
      done,
    );

    const updated = await prisma.progress.update({
      where: { userId },
      data: {
        completedStepIds: Array.from(done),
        step1Completed: flags.step1Completed,
        step2Completed: flags.step2Completed,
        step3Completed: flags.step3Completed,
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
        completedStepIds: updated.completedStepIds,
      },
    });
  } catch (e) {
    logApiError("POST /api/user/progress", e, requestId);
    return serverError("Could not update progress", requestId);
  }
}
