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

async function readApiPayload<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type ErrorPayload = {
  error?: string;
  message?: string;
  requestId?: string;
};

function firstNonEmptyString(...candidates: (string | undefined)[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return undefined;
}

function responseError(res: Response, fallback: string, payload?: ErrorPayload | null): Error {
  const fromBody = firstNonEmptyString(payload?.error, payload?.message);
  if (fromBody) return new Error(fromBody);
  if (res.status === 503) return new Error("Service is temporarily unavailable. Please try again.");
  if (res.status === 429) return new Error("Too many requests. Please wait and retry.");
  return new Error(`${fallback} (${res.status})`);
}

export async function createUser(body: CreateUserBody): Promise<CreateUserResponse> {
  const res = await fetch("/api/user/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await readApiPayload<CreateUserResponse & ErrorPayload>(res);

  if (!res.ok) {
    throw responseError(res, "Account creation failed", data);
  }
  if (data?.success === false) {
    throw responseError(res, "Account creation failed", data);
  }
  if (!data?.userId) {
    throw new Error(firstNonEmptyString(data?.error, data?.message) ?? "Invalid response from server");
  }

  return {
    userId: data.userId,
    success: true,
    created: data.created,
  };
}

export async function fetchUserProgress(userId: string): Promise<{ progress: ProgressRow; referralCount: number }> {
  const q = new URLSearchParams({ userId });
  const res = await fetch(`/api/user/progress?${q}`, { cache: "no-store" });
  const data = await readApiPayload<{
    progress?: ProgressRow;
    referralCount?: number;
    error?: string;
  }>(res);
  if (!res.ok || !data?.progress) {
    throw responseError(res, "Could not load progress", data);
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
  const data = await readApiPayload<{ progress?: ProgressRow; error?: string }>(res);
  if (!res.ok || !data?.progress) {
    throw responseError(res, "Could not save progress", data);
  }
  return data.progress;
}

export async function fetchAppSettings(language: string): Promise<PublicAppSettings> {
  const q = new URLSearchParams({ language });
  const res = await fetch(`/api/settings/get?${q}`, { cache: "no-store" });
  const data = await readApiPayload<PublicAppSettings & { error?: string }>(res);
  if (!res.ok || !data) {
    throw responseError(res, "Could not load content");
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
