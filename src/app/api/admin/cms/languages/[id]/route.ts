import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

type PatchBody = {
  name?: string;
  code?: string;
  isActive?: boolean;
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

  const data: { name?: string; code?: string; isActive?: boolean } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.code === "string" && body.code.trim()) {
    const code = body.code.trim().toLowerCase();
    if (!/^[a-z]{2,12}(-[a-z]{2,12})?$/.test(code)) {
      return badRequest("Invalid code format", requestId);
    }
    data.code = code;
  }
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return badRequest("No updates", requestId);
  }

  try {
    const lang = await prisma.language.update({
      where: { id },
      data,
    });
    return NextResponse.json({ language: lang });
  } catch (e) {
    logApiError("PATCH /api/admin/cms/languages/[id]", e, requestId);
    return serverError("Update failed", requestId);
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { id } = await ctx.params;
  if (!isUuid(id)) return badRequest("Invalid id", requestId);

  try {
    await prisma.language.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logApiError("DELETE /api/admin/cms/languages/[id]", e, requestId);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
