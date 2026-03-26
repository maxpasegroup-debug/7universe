import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth/admin-session";

export async function isAdminRequest(): Promise<boolean> {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}
