import { NextResponse } from "next/server";
import { getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth/require-admin";

export async function GET() {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) {
    return unauthorized("Unauthorized", requestId);
  }

  try {
    const [totalUsers, completedUsers, highIntentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.progress.count({
        where: {
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
        },
      }),
      prisma.progress.count({ where: { step3Completed: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      completedUsers,
      highIntentUsers,
    });
  } catch (e) {
    logApiError("admin/stats", e, requestId);
    return serverError("Server error", requestId);
  }
}
