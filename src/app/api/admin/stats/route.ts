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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todaySignups,
      step1Completed,
      step2Completed,
      step3Completed,
      completedUsers,
      highIntentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.progress.count({ where: { step1Completed: true } }),
      prisma.progress.count({ where: { step2Completed: true } }),
      prisma.progress.count({ where: { step3Completed: true } }),
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
      todaySignups,
      completedUsers,
      highIntentUsers,
      funnel: {
        totalUsers,
        step1Completed,
        step2Completed,
        step3Completed,
        completedUsers,
      },
    });
  } catch (e) {
    logApiError("admin/stats", e, requestId);
    return serverError("Server error", requestId);
  }
}
