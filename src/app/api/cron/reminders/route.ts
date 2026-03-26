import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInactivityReminder } from "@/lib/whatsapp";

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
    const supabase = createAdminClient();
    const { data: rows } = await supabase
      .from("onboarding_profiles")
      .select("id, mobile, name, last_activity_at, whatsapp_reminder_sent_at, step3_completed")
      .eq("step3_completed", false)
      .lt("last_activity_at", cutoff)
      .is("whatsapp_reminder_sent_at", null)
      .limit(50);

    let sent = 0;
    for (const row of rows ?? []) {
      const r = await sendInactivityReminder(row.mobile, row.name);
      if (r.ok) {
        await supabase
          .from("onboarding_profiles")
          .update({ whatsapp_reminder_sent_at: new Date().toISOString() })
          .eq("id", row.id);
        sent += 1;
      }
    }

    return NextResponse.json({ ok: true, processed: rows?.length ?? 0, reminders_sent: sent });
  } catch (e) {
    console.error("[cron/reminders]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
