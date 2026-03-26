/** Public app base URL for referral links (browser uses current origin when available). */
export function getAppPublicUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getServerAppBaseUrl();
}

/** Base URL for server-only code (API routes, metadata). No `window`. */
export function getServerAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit?.startsWith("http")) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
