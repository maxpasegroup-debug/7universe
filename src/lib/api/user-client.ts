import type { PublicAppSettings } from "@/lib/media-public-settings";

export type CreateUserBody = {
  name: string;
  mobile: string;
  language: string;
  referrerId?: string;
};

export type CreateUserResponse = {
  userId: string;
  success: boolean;
  created?: boolean;
};

export type ProgressRow = {
  id: string;
  userId: string;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  score: number;
};

export async function createUser(body: CreateUserBody): Promise<CreateUserResponse> {
  const res = await fetch("/api/user/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as CreateUserResponse & { error?: string };
  if (!res.ok || !data.success) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not create account");
  }
  if (!data.userId) throw new Error("Invalid response");
  return data;
}

export async function fetchUserProgress(userId: string): Promise<{ progress: ProgressRow; referralCount: number }> {
  const q = new URLSearchParams({ userId });
  const res = await fetch(`/api/user/progress?${q}`, { cache: "no-store" });
  const data = (await res.json()) as {
    progress?: ProgressRow;
    referralCount?: number;
    error?: string;
  };
  if (!res.ok || !data.progress) {
    throw new Error(data.error ?? "Could not load progress");
  }
  return {
    progress: data.progress,
    referralCount: typeof data.referralCount === "number" ? data.referralCount : 0,
  };
}

export async function postUserProgress(userId: string, step: 1 | 2 | 3): Promise<ProgressRow> {
  const res = await fetch("/api/user/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, step }),
  });
  const data = (await res.json()) as { progress?: ProgressRow; error?: string };
  if (!res.ok || !data.progress) {
    throw new Error(data.error ?? "Could not save progress");
  }
  return data.progress;
}

export async function fetchAppSettings(language: string): Promise<PublicAppSettings> {
  const q = new URLSearchParams({ language });
  const res = await fetch(`/api/settings/get?${q}`, { cache: "no-store" });
  const data = (await res.json()) as PublicAppSettings & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Could not load content");
  }
  if (!data.step1VideoUrl || !data.step2PdfUrl || !data.step3VideoUrl) {
    throw new Error("Invalid settings response");
  }
  return {
    step1VideoUrl: data.step1VideoUrl,
    step2PdfUrl: data.step2PdfUrl,
    step3VideoUrl: data.step3VideoUrl,
    joinLink: data.joinLink ?? "",
  };
}
