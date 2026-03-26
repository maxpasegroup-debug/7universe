/** Public app base URL for referral links (browser uses current origin when available). */
export function getAppPublicUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const u = process.env.NEXT_PUBLIC_APP_URL;
  if (u?.startsWith("http")) return u.replace(/\/$/, "");
  return "http://localhost:3000";
}
