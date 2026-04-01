export const STORAGE_KEYS = {
  LANGUAGE: "7universe-language",
  USER: "7universe-user",
  PROFILE: "7universe-profile",
  /** Referrer user id (UUID) from `?ref=` — carried to signup. */
  REFERRER_ID: "7universe-referrer-id",
} as const;

/** Legacy shape — migrated to StoredProfile on read when possible. */
export type StoredUser = {
  name: string;
  mobile: string;
};

/** `id` is the Prisma user id (UUID), used as `userId` in APIs. */
export type StoredProfile = {
  id: string;
  name: string;
  mobile: string;
};

export function getStoredLanguage(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE)?.trim().toLowerCase();
  if (!v || v.length > 24) return null;
  return v;
}

export function setStoredLanguage(code: string): void {
  window.localStorage.setItem(STORAGE_KEYS.LANGUAGE, code.trim().toLowerCase());
}

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        "id" in parsed &&
        "name" in parsed &&
        "mobile" in parsed &&
        typeof (parsed as StoredProfile).id === "string" &&
        typeof (parsed as StoredProfile).name === "string" &&
        typeof (parsed as StoredProfile).mobile === "string"
      ) {
        return parsed as StoredProfile;
      }
    } catch {
      /* fall through */
    }
  }
  const legacy = readLegacyUser();
  if (legacy) {
    return { id: "", name: legacy.name, mobile: legacy.mobile };
  }
  return null;
}

function readLegacyUser(): StoredUser | null {
  const raw = window.localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "name" in parsed &&
      "mobile" in parsed &&
      typeof (parsed as StoredUser).name === "string" &&
      typeof (parsed as StoredUser).mobile === "string"
    ) {
      return { name: (parsed as StoredUser).name, mobile: (parsed as StoredUser).mobile };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredProfile(profile: StoredProfile): void {
  window.localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  window.localStorage.removeItem(STORAGE_KEYS.USER);
}

export function clearStoredProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.PROFILE);
  window.localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredReferrerId(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEYS.REFERRER_ID)?.trim();
  return v || null;
}

export function setStoredReferrerId(id: string): void {
  window.localStorage.setItem(STORAGE_KEYS.REFERRER_ID, id.trim());
}

export function clearStoredReferrerId(): void {
  window.localStorage.removeItem(STORAGE_KEYS.REFERRER_ID);
}
