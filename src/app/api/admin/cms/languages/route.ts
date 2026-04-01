import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

type PostBody = {
  name?: string;
  code?: string;
  isActive?: boolean;
};

export async function GET() {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  try {
    const languages = await prisma.language.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json({ languages });
  } catch (e) {
    logApiError("GET /api/admin/cms/languages", e, requestId);
    return serverError("Failed to load languages", requestId);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return badRequest("Invalid JSON", requestId);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim().toLowerCase() : "";
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  if (!name || !code) {
    return badRequest("name and code are required", requestId);
  }
  if (!/^[a-z]{2,12}(-[a-z]{2,12})?$/.test(code)) {
    return badRequest("code must be 2–12 letters, optional hyphen segment (e.g. en, ta-lk)", requestId);
  }

  try {
    const lang = await prisma.language.create({
      data: { name, code, isActive },
    });
    return NextResponse.json({ language: lang });
  } catch (e) {
    logApiError("POST /api/admin/cms/languages", e, requestId);
    return serverError("Could not create language (duplicate code?)", requestId);
  }
}
