import type { LanguageCode } from "./i18n";

/** Legacy: 10-digit India local only. Prefer {@link normalizeInternationalMobile}. */
export function normalizeMobile(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

/** @deprecated Use {@link isValidInternationalMobile} */
export function isValidMobile10(digits: string): boolean {
  return /^\d{10}$/.test(digits);
}

/**
 * Normalizes to E.164: leading + and digits only.
 * Accepts `+CC…`, raw digits, or legacy 10-digit India (assumes +91).
 */
export function normalizeInternationalMobile(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const allDigits = trimmed.replace(/\D/g, "");
  if (!hasPlus && allDigits.length === 10) {
    return `+91${allDigits}`;
  }
  if (!hasPlus) {
    return `+${allDigits}`;
  }
  const afterPlus = trimmed.slice(1).replace(/\D/g, "");
  return `+${afterPlus}`;
}

/** E.164: + then 8–15 total digits (ITU-T E.164). */
export function isValidInternationalMobile(e164: string): boolean {
  if (!e164.startsWith("+")) return false;
  const d = e164.slice(1);
  if (!/^\d+$/.test(d)) return false;
  return d.length >= 8 && d.length <= 15;
}

/** Digits only (no +) for react-phone-input-2 `value`. */
export function e164ToPhoneInputDigits(e164: string): string {
  return e164.replace(/^\+/, "").replace(/\D/g, "");
}

/** Compare two stored/user-supplied phone values as E.164. */
export function mobilesEqual(a: string, b: string): boolean {
  const x = normalizeInternationalMobile(a);
  const y = normalizeInternationalMobile(b);
  if (!x || !y) return false;
  return x === y;
}

export function isLanguageCode(v: string): v is LanguageCode {
  return v === "en" || v === "ml" || v === "ta";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string): boolean {
  return UUID_RE.test(v);
}

export function isValid4DigitPin(v: string): boolean {
  return /^\d{4}$/.test(v.trim());
}
