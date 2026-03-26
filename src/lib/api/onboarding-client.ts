import type { AppSettingsRow } from "@/types/app-settings";
import type { OnboardingProfilePublic, OnboardingProfileRow } from "@/types/onboarding";

const base = "/api/onboarding";

export async function registerProfile(payload: {
  name: string;
  mobile: string;
  language: string;
  referral_code?: string;
}): Promise<{ profile: OnboardingProfileRow }> {
  const res = await fetch(`${base}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { error?: string; profile?: OnboardingProfileRow };
  if (!res.ok) {
    throw new Error(data.error ?? "Registration failed");
  }
  if (!data.profile) throw new Error("Invalid response");
  return { profile: data.profile };
}

export async function fetchProgress(id: string, mobile: string): Promise<{ profile: OnboardingProfilePublic }> {
  const q = new URLSearchParams({ id, mobile });
  const res = await fetch(`${base}/progress?${q}`);
  const data = (await res.json()) as { error?: string; profile?: OnboardingProfilePublic };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to load");
  }
  if (!data.profile) throw new Error("Invalid response");
  return { profile: data.profile };
}

export async function patchProgress(payload: {
  id: string;
  mobile: string;
  step1_completed?: boolean;
  step2_completed?: boolean;
  step3_completed?: boolean;
}): Promise<{ profile: OnboardingProfilePublic }> {
  const res = await fetch(`${base}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { error?: string; profile?: OnboardingProfilePublic };
  if (!res.ok) {
    throw new Error(data.error ?? "Update failed");
  }
  if (!data.profile) throw new Error("Invalid response");
  return { profile: data.profile };
}

export async function postConvert(id: string, mobile: string): Promise<{ profile: OnboardingProfileRow }> {
  const res = await fetch(`${base}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, mobile }),
  });
  const data = (await res.json()) as { error?: string; profile?: OnboardingProfileRow };
  if (!res.ok) {
    throw new Error(data.error ?? "Convert failed");
  }
  if (!data.profile) throw new Error("Invalid response");
  return { profile: data.profile };
}

export async function fetchPublicContent(): Promise<{ settings: AppSettingsRow }> {
  const res = await fetch("/api/content", { cache: "no-store" });
  const data = (await res.json()) as { error?: string; settings?: AppSettingsRow };
  if (!res.ok) throw new Error(data.error ?? "Content failed");
  if (!data.settings) throw new Error("Invalid response");
  return { settings: data.settings };
}
