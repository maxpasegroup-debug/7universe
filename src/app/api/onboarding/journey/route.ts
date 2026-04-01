import { NextResponse } from "next/server";
import { badRequest, getRequestId, logApiError, serverError } from "@/lib/api";
import { loadJourneyWithLanguage } from "@/lib/cms/journey";

export async function GET(request: Request) {
  const requestId = getRequestId();
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("language")?.trim() ?? "";
  if (!raw) {
    return badRequest("language is required", requestId);
  }

  try {
    const data = await loadJourneyWithLanguage(raw.toLowerCase());
    if (!data || data.steps.length === 0) {
      return NextResponse.json({ error: "Journey not configured for this language" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e) {
    logApiError("GET /api/onboarding/journey", e, requestId);
    return serverError("Could not load journey", requestId);
  }
}
