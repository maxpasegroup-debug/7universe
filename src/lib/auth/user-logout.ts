import { clearStoredProfile } from "@/lib/storage";

/** Clears httpOnly session cookie (server) and local profile so the user cannot call progress APIs. */
export async function performUserLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch {
    /* still clear local session */
  }
  clearStoredProfile();
}
