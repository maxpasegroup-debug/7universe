import { MaterialKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const KINDS = new Set(Object.values(MaterialKind));

type PatchBody = {
  title?: string;
  fileUrl?: string;
  materialType?: string;
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

  const data: { title?: string; fileUrl?: string; materialType?: MaterialKind } = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.fileUrl === "string" && body.fileUrl.trim()) data.fileUrl = body.fileUrl.trim();
  if (body.materialType !== undefined) {
    if (!KINDS.has(body.materialType as MaterialKind)) return badRequest("Invalid materialType", requestId);
    data.materialType = body.materialType as MaterialKind;
  }

  if (Object.keys(data).length === 0) return badRequest("No updates", requestId);

  try {
    const material = await prisma.material.update({ where: { id }, data });
    return NextResponse.json({ material });
  } catch (e) {
    logApiError("PATCH /api/admin/cms/materials/[id]", e, requestId);
    return serverError("Update failed", requestId);
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { id } = await ctx.params;
  if (!isUuid(id)) return badRequest("Invalid id", requestId);

  try {
    await prisma.material.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logApiError("DELETE /api/admin/cms/materials/[id]", e, requestId);
    return serverError("Delete failed (in use by a step?)", requestId);
  }
}
