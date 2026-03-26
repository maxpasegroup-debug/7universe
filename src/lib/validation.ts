import type { LanguageCode } from "./i18n";

export function normalizeMobile(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

export function isValidMobile10(digits: string): boolean {
  return /^\d{10}$/.test(digits);
}

export function isLanguageCode(v: string): v is LanguageCode {
  return v === "en" || v === "ml" || v === "ta";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string): boolean {
  return UUID_RE.test(v);
}
