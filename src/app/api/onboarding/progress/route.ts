import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueReferralCode } from "@/lib/referral-code";
import { computeLeadScore, isHighIntent } from "@/lib/lead-score";
import { sendExpertConnectMessage } from "@/lib/whatsapp";
import { isValidMobile10, normalizeMobile } from "@/lib/validation";
import type { OnboardingProfilePublic, OnboardingProfileRow } from "@/types/onboarding";

const SELECT_FIELDS =
  "id, mobile, name, language, step1_completed, step2_completed, step3_completed, referral_code, referrer_id, lead_score, high_intent, converted, last_activity_at, created_at, updated_at";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const mobile = searchParams.get("mobile");

  if (!id || !mobile) {
    return NextResponse.json({ error: "Missing id or mobile" }, { status: 400 });
  }

  const m = normalizeMobile(mobile);
  if (!isValidMobile10(m)) {
    return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("onboarding_profiles").select(SELECT_FIELDS).eq("id", id).maybeSingle();

    if (error) {
      console.error("[onboarding/progress GET]", error);
      return NextResponse.json({ error: "Could not load progress" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (data.mobile !== m) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let profile = data as OnboardingProfileRow;

    if (!profile.referral_code) {
      const code = await generateUniqueReferralCode(supabase);
      const { data: upd } = await supabase
        .from("onboarding_profiles")
        .update({ referral_code: code, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(SELECT_FIELDS)
        .single();
      if (upd) profile = upd as OnboardingProfileRow;
    }

    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", profile.id);

    const out: OnboardingProfilePublic = {
      ...profile,
      referral_count: count ?? 0,
    };

    return NextResponse.json({ profile: out });
  } catch (e) {
    console.error("[onboarding/progress GET]", e);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
}

type PatchBody = {
  id?: string;
  mobile?: string;
  step1_completed?: boolean;
  step2_completed?: boolean;
  step3_completed?: boolean;
};

export async function PATCH(request: Request) {
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const mobile = typeof body.mobile === "string" ? normalizeMobile(body.mobile) : "";

  if (!id || !isValidMobile10(mobile)) {
    return NextResponse.json({ error: "Invalid id or mobile" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };

  if (typeof body.step1_completed === "boolean") updates.step1_completed = body.step1_completed;
  if (typeof body.step2_completed === "boolean") updates.step2_completed = body.step2_completed;
  if (typeof body.step3_completed === "boolean") updates.step3_completed = body.step3_completed;

  if (Object.keys(updates).length === 2) {
    return NextResponse.json({ error: "No progress fields to update" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: row, error: fetchErr } = await supabase
      .from("onboarding_profiles")
      .select(
        "mobile, step1_completed, step2_completed, step3_completed, converted, whatsapp_expert_sent_at"
      )
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (row.mobile !== mobile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: afterStep, error: uerr } = await supabase
      .from("onboarding_profiles")
      .update(updates)
      .eq("id", id)
      .select(
        "id, mobile, name, language, step1_completed, step2_completed, step3_completed, referral_code, referrer_id, converted, whatsapp_expert_sent_at"
      )
      .single();

    if (uerr || !afterStep) {
      console.error("[onboarding/progress PATCH]", uerr);
      return NextResponse.json({ error: "Could not update progress" }, { status: 500 });
    }

    const lead_score = computeLeadScore({
      step1_completed: afterStep.step1_completed,
      step2_completed: afterStep.step2_completed,
      step3_completed: afterStep.step3_completed,
      converted: afterStep.converted,
    });
    const high_intent = isHighIntent(lead_score, afterStep.step3_completed);

    const { data: final, error: ferr } = await supabase
      .from("onboarding_profiles")
      .update({
        lead_score,
        high_intent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(SELECT_FIELDS)
      .single();

    if (ferr || !final) {
      return NextResponse.json({ error: "Could not finalize progress" }, { status: 500 });
    }

    const profile = final as OnboardingProfileRow;

    if (high_intent && !row.whatsapp_expert_sent_at) {
      const r = await sendExpertConnectMessage(profile.mobile, profile.name);
      if (r.ok) {
        await supabase
          .from("onboarding_profiles")
          .update({ whatsapp_expert_sent_at: new Date().toISOString() })
          .eq("id", id);
      }
    }

    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", profile.id);

    const out: OnboardingProfilePublic = {
      ...profile,
      referral_count: count ?? 0,
    };

    return NextResponse.json({ profile: out });
  } catch (e) {
    console.error("[onboarding/progress PATCH]", e);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
}
