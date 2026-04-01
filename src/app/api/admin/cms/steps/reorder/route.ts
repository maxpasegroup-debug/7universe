import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

type Body = {
  languageId?: string;
  orderedIds?: string[];
};

export async function POST(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON", requestId);
  }

  const languageId = typeof body.languageId === "string" ? body.languageId.trim() : "";
  const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : [];

  if (!isUuid(languageId)) return badRequest("languageId must be a UUID", requestId);
  if (!orderedIds.length) return badRequest("orderedIds must be a non-empty array", requestId);
  if (!orderedIds.every((id) => typeof id === "string" && isUuid(id))) {
    return badRequest("orderedIds must be UUID strings", requestId);
  }

  try {
    const existing = await prisma.step.findMany({
      where: { languageId },
      select: { id: true },
    });
    const set = new Set(existing.map((s) => s.id));
    if (orderedIds.length !== set.size || orderedIds.some((id) => !set.has(id))) {
      return badRequest("orderedIds must list every step for this language exactly once", requestId);
    }

    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.step.update({ where: { id }, data: { sortOrder: index } })),
    );

    const steps = await prisma.step.findMany({
      where: { languageId },
      orderBy: { sortOrder: "asc" },
      include: { content: true, material: true },
    });
    return NextResponse.json({ steps });
  } catch (e) {
    logApiError("POST /api/admin/cms/steps/reorder", e, requestId);
    return serverError("Reorder failed", requestId);
  }
}
