import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Liveness + database check for Railway / ops. Does not require auth.
 */
export async function GET() {
  try {
    await prisma.user.findFirst({ select: { id: true } });
    return NextResponse.json({ ok: true, success: true, status: "OK" });
  } catch (e) {
    console.error("[GET /api/health] Database check failed", e);
    const message = e instanceof Error ? e.message : "Database check failed";
    return NextResponse.json(
      { ok: false, success: false, status: "error", error: message },
      { status: 503 }
    );
  }
}
