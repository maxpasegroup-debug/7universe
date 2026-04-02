import { NextResponse } from "next/server";
import { getRequestId, logApiError, serverError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const requestId = getRequestId();

  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    return NextResponse.json({ languages });
  } catch (e) {
    logApiError("GET /api/public/languages", e, requestId);
    return serverError("Could not load languages", requestId);
  }
}
