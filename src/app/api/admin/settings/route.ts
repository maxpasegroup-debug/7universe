import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { isLanguageCode } from "@/lib/validation";

type Language = "en" | "ml" | "ta";

type SettingsRow = {
  id: string;
  language: Language;
  step1VideoUrl: string;
  step2PdfUrl: string;
  step3VideoUrl: string;
  joinLink: string;
};

function toOut(row: {
  id: string;
  language: string;
  step1VideoUrl: string;
  step2PdfUrl: string;
  step3VideoUrl: string;
  joinLink: string;
}): SettingsRow {
  return {
    id: row.id,
    language: row.language as Language,
    step1VideoUrl: row.step1VideoUrl,
    step2PdfUrl: row.step2PdfUrl,
    step3VideoUrl: row.step3VideoUrl,
    joinLink: row.joinLink,
  };
}

export async function GET() {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) {
    return unauthorized("Unauthorized", requestId);
  }

  try {
    const rows = await prisma.appSettings.findMany({
      where: { language: { in: ["en", "ml", "ta"] } },
      orderBy: { language: "asc" },
    });
    return NextResponse.json({ settings: rows.map(toOut) });
  } catch (e) {
    logApiError("admin/settings GET", e, requestId);
    return serverError("Server error", requestId);
  }
}

type PatchBody = {
  settings?: Array<{
    language?: string;
    step1VideoUrl?: string;
    step2PdfUrl?: string;
    step3VideoUrl?: string;
    joinLink?: string;
  }>;
};

export async function PATCH(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) {
    return unauthorized("Unauthorized", requestId);
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return badRequest("Invalid JSON", requestId);
  }

  if (!Array.isArray(body.settings) || body.settings.length === 0) {
    return badRequest("settings must be a non-empty array", requestId);
  }

  for (const row of body.settings) {
    if (!row || !isLanguageCode(typeof row.language === "string" ? row.language : "")) {
      return badRequest("Each settings row requires language: en/ml/ta", requestId);
    }
    const s1 = typeof row.step1VideoUrl === "string" ? row.step1VideoUrl.trim() : "";
    const s2 = typeof row.step2PdfUrl === "string" ? row.step2PdfUrl.trim() : "";
    const s3 = typeof row.step3VideoUrl === "string" ? row.step3VideoUrl.trim() : "";
    const join = typeof row.joinLink === "string" ? row.joinLink.trim() : "";
    if (!s1 || !s2 || !s3 || !join) {
      return badRequest(`All URL fields are required for language ${row.language}`, requestId);
    }
  }

  try {
    await prisma.$transaction(
      body.settings.map((row) =>
        prisma.appSettings.upsert({
          where: { language: row.language as Language },
          create: {
            language: row.language as Language,
            step1VideoUrl: row.step1VideoUrl!.trim(),
            step2PdfUrl: row.step2PdfUrl!.trim(),
            step3VideoUrl: row.step3VideoUrl!.trim(),
            joinLink: row.joinLink!.trim(),
          },
          update: {
            step1VideoUrl: row.step1VideoUrl!.trim(),
            step2PdfUrl: row.step2PdfUrl!.trim(),
            step3VideoUrl: row.step3VideoUrl!.trim(),
            joinLink: row.joinLink!.trim(),
          },
        })
      )
    );

    const updated = await prisma.appSettings.findMany({
      where: { language: { in: ["en", "ml", "ta"] } },
      orderBy: { language: "asc" },
    });
    return NextResponse.json({ settings: updated.map(toOut) });
  } catch (e) {
    logApiError("admin/settings PATCH", e, requestId);
    return serverError("Update failed", requestId);
  }
}
