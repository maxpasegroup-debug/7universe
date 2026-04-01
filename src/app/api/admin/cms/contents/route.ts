import { ContentCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/validation";

const CATEGORIES = new Set(Object.values(ContentCategory));

export async function GET(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) return unauthorized("Unauthorized", requestId);

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId")?.trim() ?? "";
  if (!isUuid(languageId)) {
    return badRequest("languageId (uuid) is required", requestId);
  }

  try {
    const contents = await prisma.content.findMany({
      where: { languageId },
      orderBy: [{ contentType: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ contents });
  } catch (e) {
    logApiError("GET /api/admin/cms/contents", e, requestId);
    return serverError("Failed to load contents", requestId);
  }
}

type PostBody = {
  languageId?: string;
  contentType?: string;
  title?: string;
  videoUrl?: string;
  sortOrder?: number;
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
  const rawType = typeof body.contentType === "string" ? body.contentType.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? body.sortOrder : 0;

  if (!isUuid(languageId)) return badRequest("languageId must be a UUID", requestId);
  if (!CATEGORIES.has(rawType as ContentCategory)) {
    return badRequest("contentType must be orientation, training, or advanced", requestId);
  }
  if (!title || !videoUrl) {
    return badRequest("title and videoUrl are required", requestId);
  }

  try {
    const row = await prisma.content.create({
      data: {
        languageId,
        contentType: rawType as ContentCategory,
        title,
        videoUrl,
        sortOrder,
      },
    });
    return NextResponse.json({ content: row });
  } catch (e) {
    logApiError("POST /api/admin/cms/contents", e, requestId);
    return serverError("Could not create content", requestId);
  }
}
