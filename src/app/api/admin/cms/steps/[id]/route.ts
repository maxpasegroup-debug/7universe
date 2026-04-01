import { StepKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, notFound, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const KINDS = new Set(Object.values(StepKind));

type PatchBody = {
  title?: string;
  stepType?: string;
  sortOrder?: number;
  contentId?: string | null;
  materialId?: string | null;
  actionUrl?: string | null;
};

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { id } = await ctx.params;
  if (!isUuid(id)) return badRequest("Invalid id", requestId);

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return badRequest("Invalid JSON", requestId);
  }

  const current = await prisma.step.findUnique({ where: { id } });
  if (!current) {
    return notFound("Step not found", requestId);
  }

  const nextKind = body.stepType !== undefined ? (body.stepType as StepKind) : current.stepType;
  if (body.stepType !== undefined && !KINDS.has(nextKind)) {
    return badRequest("Invalid stepType", requestId);
  }

  const title =
    body.title !== undefined ? (typeof body.title === "string" ? body.title.trim() : "") : current.title;
  if (!title) return badRequest("title cannot be empty", requestId);

  let contentId = current.contentId;
  if (body.contentId !== undefined) {
    contentId =
      body.contentId === null ? null : typeof body.contentId === "string" && isUuid(body.contentId) ? body.contentId : null;
  }

  let materialId = current.materialId;
  if (body.materialId !== undefined) {
    materialId =
      body.materialId === null
        ? null
        : typeof body.materialId === "string" && isUuid(body.materialId)
          ? body.materialId
          : null;
  }

  let actionUrl = current.actionUrl;
  if (body.actionUrl !== undefined) {
    actionUrl =
      body.actionUrl === null ? null : typeof body.actionUrl === "string" ? body.actionUrl.trim() || null : null;
  }

  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? body.sortOrder : current.sortOrder;

  if (nextKind === "video" && !contentId) return badRequest("video steps require contentId", requestId);
  if (nextKind === "pdf" && !materialId) return badRequest("pdf steps require materialId", requestId);
  if (nextKind === "action" && !actionUrl) return badRequest("action steps require actionUrl", requestId);

  try {
    const step = await prisma.step.update({
      where: { id },
      data: {
        title,
        stepType: nextKind,
        sortOrder,
        contentId: nextKind === "video" ? contentId : null,
        materialId: nextKind === "pdf" ? materialId : null,
        actionUrl: nextKind === "action" ? actionUrl : null,
      },
    });
    return NextResponse.json({ step });
  } catch (e) {
    logApiError("PATCH /api/admin/cms/steps/[id]", e, requestId);
    return serverError("Update failed", requestId);
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { id } = await ctx.params;
  if (!isUuid(id)) return badRequest("Invalid id", requestId);

  try {
    await prisma.step.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logApiError("DELETE /api/admin/cms/steps/[id]", e, requestId);
    return serverError("Delete failed", requestId);
  }
}
