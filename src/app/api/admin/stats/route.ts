import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/require-admin";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { count: total_users } = await supabase.from("onboarding_profiles").select("*", { count: "exact", head: true });

    const { count: conversions } = await supabase
      .from("onboarding_profiles")
      .select("*", { count: "exact", head: true })
      .eq("converted", true);

    const { count: drop_step1 } = await supabase
      .from("onboarding_profiles")
      .select("*", { count: "exact", head: true })
      .eq("step1_completed", false);

    const { count: high_intent_users } = await supabase
      .from("onboarding_profiles")
      .select("*", { count: "exact", head: true })
      .eq("high_intent", true);

    const { data: scoreRows } = await supabase.from("onboarding_profiles").select("lead_score");

    const scores = (scoreRows ?? []).map((r) => r.lead_score as number);
    const avg_lead_score =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const { count: referral_events } = await supabase.from("referrals").select("*", { count: "exact", head: true });

    return NextResponse.json({
      total_users: total_users ?? 0,
      conversions: conversions ?? 0,
      drop_off_no_step1: drop_step1 ?? 0,
      high_intent_users: high_intent_users ?? 0,
      avg_lead_score,
      referral_signups: referral_events ?? 0,
    });
  } catch (e) {
    console.error("[admin/stats]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
