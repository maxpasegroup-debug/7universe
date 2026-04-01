import { MaterialKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const KINDS = new Set(Object.values(MaterialKind));

export async function GET(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId")?.trim() ?? "";
  if (!isUuid(languageId)) {
    return badRequest("languageId (uuid) is required", requestId);
  }

  try {
    const materials = await prisma.material.findMany({
      where: { languageId },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ materials });
  } catch (e) {
    logApiError("GET /api/admin/cms/materials", e, requestId);
    return serverError("Failed to load materials", requestId);
  }
}

type PostBody = {
  languageId?: string;
  title?: string;
  fileUrl?: string;
  materialType?: string;
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
  const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl.trim() : "";
  const rawKind = typeof body.materialType === "string" ? body.materialType.trim() : "";

  if (!isUuid(languageId)) return badRequest("languageId must be a UUID", requestId);
  if (!KINDS.has(rawKind as MaterialKind)) {
    return badRequest("materialType must be pdf or link", requestId);
  }
  if (!title || !fileUrl) return badRequest("title and fileUrl are required", requestId);

  try {
    const row = await prisma.material.create({
      data: {
        languageId,
        title,
        fileUrl,
        materialType: rawKind as MaterialKind,
      },
    });
    return NextResponse.json({ material: row });
  } catch (e) {
    logApiError("POST /api/admin/cms/materials", e, requestId);
    return serverError("Could not create material", requestId);
  }
}
