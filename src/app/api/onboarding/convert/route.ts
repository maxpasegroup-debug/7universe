import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLeadScore, isHighIntent } from "@/lib/lead-score";
import { isValidInternationalMobile, mobilesEqual, normalizeInternationalMobile } from "@/lib/validation";
import type { OnboardingProfileRow } from "@/types/onboarding";

type Body = {
  id?: string;
  mobile?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const mobile = typeof body.mobile === "string" ? normalizeInternationalMobile(body.mobile) : "";
  if (!id || !isValidInternationalMobile(mobile)) {
    return NextResponse.json({ error: "Invalid id or mobile" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: row, error: fe } = await supabase
      .from("onboarding_profiles")
      .select("id, mobile, name, step1_completed, step2_completed, step3_completed, converted")
      .eq("id", id)
      .maybeSingle();

    if (fe || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!mobilesEqual(row.mobile, mobile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const lead_score = computeLeadScore({
      step1_completed: row.step1_completed,
      step2_completed: row.step2_completed,
      step3_completed: row.step3_completed,
      converted: true,
    });
    const high_intent = isHighIntent(lead_score, row.step3_completed);

    const { data, error } = await supabase
      .from("onboarding_profiles")
      .update({
        converted: true,
        lead_score,
        high_intent,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, mobile, name, language, step1_completed, step2_completed, step3_completed, referral_code, referrer_id, lead_score, high_intent, converted, last_activity_at, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("[convert]", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const profile = data as OnboardingProfileRow;

    return NextResponse.json({ profile });
  } catch (e) {
    console.error("[convert]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
