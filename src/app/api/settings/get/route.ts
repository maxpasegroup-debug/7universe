import { NextResponse } from "next/server";
import { getRequestId, logApiError, notFound, serverError } from "@/lib/api";
import { JOIN_EXTERNAL_URL, SAFEPAL_VIDEO_BASE_PATH } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const DEFAULT_LANGUAGE = "en";

export async function GET(request: Request) {
  const requestId = getRequestId();
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("language");
  const normalized = raw !== null && raw.trim() !== "" ? raw.trim().toLowerCase() : DEFAULT_LANGUAGE;

  try {
    const langOk = await prisma.language.findFirst({
      where: { code: normalized, isActive: true },
    });
    const requested = langOk ? normalized : DEFAULT_LANGUAGE;

    let row = await prisma.appSettings.findUnique({
      where: { language: requested },
    });

    if (!row && requested !== DEFAULT_LANGUAGE) {
      row = await prisma.appSettings.findUnique({
        where: { language: DEFAULT_LANGUAGE },
      });
    }

    if (!row) {
      return notFound("Settings not configured", requestId);
    }

    return NextResponse.json({
      step1VideoUrl: SAFEPAL_VIDEO_BASE_PATH,
      step2PdfUrl: row.step2PdfUrl,
      step3VideoUrl: SAFEPAL_VIDEO_BASE_PATH,
      joinLink: JOIN_EXTERNAL_URL,
    });
  } catch (e) {
    logApiError("GET /api/settings/get", e, requestId);
    return serverError("Could not load settings", requestId);
  }
}
