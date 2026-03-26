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
