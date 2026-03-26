import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic DB shape not generated
type AdminDb = SupabaseClient<any, "public", any>;

function randomSegment(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s.slice(0, 8).toUpperCase();
}

/** Generates a unique referral_code (8 hex chars) with collision retries. */
export async function generateUniqueReferralCode(supabase: AdminDb, maxAttempts = 12): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = randomSegment();
    const { data } = await supabase.from("onboarding_profiles").select("id").eq("referral_code", code).maybeSingle();
    if (!data) return code;
  }
  throw new Error("Could not allocate referral code");
}
