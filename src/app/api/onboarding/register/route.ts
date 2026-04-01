import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueReferralCode } from "@/lib/referral-code";
import { isLanguageCode, isValidInternationalMobile, normalizeInternationalMobile } from "@/lib/validation";
import { sendWelcomeMessage } from "@/lib/whatsapp";
import type { OnboardingProfileRow } from "@/types/onboarding";

type Body = {
  name?: string;
  mobile?: string;
  language?: string;
  referral_code?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mobile = typeof body.mobile === "string" ? normalizeInternationalMobile(body.mobile) : "";
  const language = typeof body.language === "string" ? body.language : "";
  const refInvite = typeof body.referral_code === "string" ? body.referral_code.trim().toUpperCase() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!isValidInternationalMobile(mobile)) {
    return NextResponse.json({ error: "Invalid number" }, { status: 400 });
  }
  if (!isLanguageCode(language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: upserted, error } = await supabase
      .from("onboarding_profiles")
      .upsert(
        {
          mobile,
          name,
          language,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mobile" }
      )
      .select(
        "id, mobile, name, language, step1_completed, step2_completed, step3_completed, referral_code, referrer_id, lead_score, high_intent, converted, last_activity_at, created_at, updated_at"
      )
      .single();

    if (error || !upserted) {
      console.error("[onboarding/register]", error);
      return NextResponse.json({ error: "Could not save profile" }, { status: 500 });
    }

    let profile = upserted as OnboardingProfileRow;

    if (!profile.referral_code) {
      const code = await generateUniqueReferralCode(supabase);
      const { data: withCode, error: e2 } = await supabase
        .from("onboarding_profiles")
        .update({ referral_code: code, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .select(
          "id, mobile, name, language, step1_completed, step2_completed, step3_completed, referral_code, referrer_id, lead_score, high_intent, converted, last_activity_at, created_at, updated_at"
        )
        .single();
      if (!e2 && withCode) profile = withCode as OnboardingProfileRow;
    }

    if (refInvite && !profile.referrer_id) {
      const { data: refUser } = await supabase
        .from("onboarding_profiles")
        .select("id")
        .eq("referral_code", refInvite)
        .maybeSingle();

      if (refUser?.id && refUser.id !== profile.id) {
        await supabase
          .from("onboarding_profiles")
          .update({ referrer_id: refUser.id, updated_at: new Date().toISOString() })
          .eq("id", profile.id);

        const { error: refErr } = await supabase
          .from("referrals")
          .insert({ referrer_id: refUser.id, referee_id: profile.id });
        if (refErr && refErr.code !== "23505") console.error("[referrals]", refErr);

        const { data: reloaded } = await supabase
          .from("onboarding_profiles")
          .select(
            "id, mobile, name, language, step1_completed, step2_completed, step3_completed, referral_code, referrer_id, lead_score, high_intent, converted, last_activity_at, created_at, updated_at"
          )
          .eq("id", profile.id)
          .single();
        if (reloaded) profile = reloaded as OnboardingProfileRow;
      }
    }

    void sendWelcomeMessage(profile.mobile, profile.name).then(async (r) => {
      if (r.ok) {
        await supabase
          .from("onboarding_profiles")
          .update({ whatsapp_welcome_sent_at: new Date().toISOString() })
          .eq("id", profile.id);
      }
    });

    return NextResponse.json({ profile });
  } catch (e) {
    console.error("[onboarding/register]", e);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
}
