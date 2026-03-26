import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getRequestId, logApiError, serverError, unauthorized } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth/require-admin";

const FILTERS = new Set(["all", "completed", "not_completed", "high_intent"]);

function buildWhere(filter: string): Prisma.UserWhereInput | undefined {
  if (filter === "completed") {
    return {
      progress: {
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
      },
    };
  }
  if (filter === "not_completed") {
    return {
      OR: [
        { progress: null },
        {
          progress: {
            OR: [
              { step1Completed: false },
              { step2Completed: false },
              { step3Completed: false },
            ],
          },
        },
      ],
    };
  }
  if (filter === "high_intent") {
    return {
      progress: {
        step3Completed: true,
      },
    };
  }
  return undefined;
}

export async function GET(request: Request) {
  const requestId = getRequestId();
  if (!(await isAdminRequest())) {
    return unauthorized("Unauthorized", requestId);
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("filter") ?? "all";
  const filter = FILTERS.has(raw) ? raw : "all";

  const where = buildWhere(filter);

  try {
    const users = await prisma.user.findMany({
      where,
      include: {
        progress: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ users });
  } catch (e) {
    logApiError("GET /api/admin/users", e, requestId);
    return serverError("Query failed", requestId);
  }
}
