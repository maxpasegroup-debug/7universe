import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "all";

  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("onboarding_profiles")
      .select(
        "id, name, mobile, language, step1_completed, step2_completed, step3_completed, converted, high_intent, lead_score, referral_code, referrer_id, created_at, last_activity_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (filter === "completed") {
      q = q.eq("converted", true).eq("step1_completed", true).eq("step2_completed", true).eq("step3_completed", true);
    } else if (filter === "not_converted") {
      q = q.eq("converted", false).eq("step3_completed", true);
    } else if (filter === "high_intent") {
      q = q.or("high_intent.eq.true,lead_score.gte.72");
    }

    const { data, error } = await q;

    if (error) {
      console.error("[admin/users]", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (e) {
    console.error("[admin/users]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
