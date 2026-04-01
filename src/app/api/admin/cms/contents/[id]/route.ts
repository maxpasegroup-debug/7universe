import { ContentCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const CATEGORIES = new Set(Object.values(ContentCategory));

type PatchBody = {
  contentType?: string;
  title?: string;
  videoUrl?: string;
  sortOrder?: number;
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

  const data: {
    contentType?: ContentCategory;
    title?: string;
    videoUrl?: string;
    sortOrder?: number;
  } = {};

  if (body.contentType !== undefined) {
    if (!CATEGORIES.has(body.contentType as ContentCategory)) {
      return badRequest("Invalid contentType", requestId);
    }
    data.contentType = body.contentType as ContentCategory;
  }
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.videoUrl === "string" && body.videoUrl.trim()) data.videoUrl = body.videoUrl.trim();
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) data.sortOrder = body.sortOrder;

  if (Object.keys(data).length === 0) return badRequest("No updates", requestId);

  try {
    const content = await prisma.content.update({ where: { id }, data });
    return NextResponse.json({ content });
  } catch (e) {
    logApiError("PATCH /api/admin/cms/contents/[id]", e, requestId);
    return serverError("Update failed", requestId);
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { id } = await ctx.params;
  if (!isUuid(id)) return badRequest("Invalid id", requestId);

  try {
    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logApiError("DELETE /api/admin/cms/contents/[id]", e, requestId);
    return serverError("Delete failed (in use by a step?)", requestId);
  }
}
