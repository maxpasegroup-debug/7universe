import { StepKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const KINDS = new Set(Object.values(StepKind));

export async function GET(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId")?.trim() ?? "";
  if (!isUuid(languageId)) {
    return badRequest("languageId (uuid) is required", requestId);
  }

  try {
    const steps = await prisma.step.findMany({
      where: { languageId },
      orderBy: { sortOrder: "asc" },
      include: { content: true, material: true },
    });
    return NextResponse.json({ steps });
  } catch (e) {
    logApiError("GET /api/admin/cms/steps", e, requestId);
    return serverError("Failed to load steps", requestId);
  }
}

type PostBody = {
  languageId?: string;
  title?: string;
  stepType?: string;
  sortOrder?: number;
  contentId?: string | null;
  materialId?: string | null;
  actionUrl?: string | null;
};

export async function POST(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return badRequest("Invalid JSON", requestId);
  }

  const languageId = typeof body.languageId === "string" ? body.languageId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const rawKind = typeof body.stepType === "string" ? body.stepType.trim() : "";
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? body.sortOrder : 0;
  const contentId =
    body.contentId === null || body.contentId === undefined
      ? null
      : typeof body.contentId === "string" && isUuid(body.contentId)
        ? body.contentId
        : null;
  const materialId =
    body.materialId === null || body.materialId === undefined
      ? null
      : typeof body.materialId === "string" && isUuid(body.materialId)
        ? body.materialId
        : null;
  const actionUrl =
    typeof body.actionUrl === "string" && body.actionUrl.trim()
      ? body.actionUrl.trim()
      : body.actionUrl === null
        ? null
        : undefined;

  if (!isUuid(languageId)) return badRequest("languageId must be a UUID", requestId);
  if (!title) return badRequest("title is required", requestId);
  if (!KINDS.has(rawKind as StepKind)) {
    return badRequest("stepType must be video, pdf, or action", requestId);
  }
  const kind = rawKind as StepKind;

  if (kind === "video" && !contentId) return badRequest("video steps require contentId", requestId);
  if (kind === "pdf" && !materialId) return badRequest("pdf steps require materialId", requestId);
  if (kind === "action" && (actionUrl === undefined || actionUrl === null || actionUrl === "")) {
    return badRequest("action steps require actionUrl", requestId);
  }

  try {
    const row = await prisma.step.create({
      data: {
        languageId,
        title,
        stepType: kind,
        sortOrder,
        contentId: kind === "video" ? contentId : null,
        materialId: kind === "pdf" ? materialId : null,
        actionUrl: kind === "action" ? (actionUrl as string) : null,
      },
    });
    return NextResponse.json({ step: row });
  } catch (e) {
    logApiError("POST /api/admin/cms/steps", e, requestId);
    return serverError("Could not create step", requestId);
  }
}
