import { NextResponse } from "next/server";
import { sendInactivityReminder } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

/** Vercel Cron or external scheduler: GET with Authorization: Bearer CRON_SECRET */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(process.env.INACTIVITY_REMINDER_DAYS ?? "4");
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const rows = await prisma.user.findMany({
      where: {
        createdAt: { lt: new Date(cutoff) },
        progress: { is: { step3Completed: false } },
      },
      select: { id: true, mobile: true, name: true },
      take: 50,
      orderBy: { createdAt: "asc" },
    });

    let sent = 0;
    for (const row of rows) {
      const r = await sendInactivityReminder(row.mobile, row.name);
      if (r.ok) {
        // We currently keep direct URL + WhatsApp integration without separate reminder-state table.
        // This cron remains best-effort and does not persist reminder sent markers.
        sent += 1;
      }
    }

    return NextResponse.json({ ok: true, processed: rows.length, reminders_sent: sent });
  } catch (e) {
    console.error("[cron/reminders]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
