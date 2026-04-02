/**
 * Canonical Indian language codes (lowercase ISO 639-1 / common extensions) and English display names.
 * Single source for seeding, signup fallbacks, and landing UI when the API is unavailable.
 * Sorted alphabetically by display name (A–Z).
 */
export const INDIAN_LANGUAGES_CATALOG = [
  { code: "as", name: "Assamese" },
  { code: "bn", name: "Bengali" },
  { code: "brx", name: "Bodo" },
  { code: "doi", name: "Dogri" },
  { code: "en", name: "English" },
  { code: "gu", name: "Gujarati" },
  { code: "hi", name: "Hindi" },
  { code: "kn", name: "Kannada" },
  { code: "ks", name: "Kashmiri" },
  { code: "kok", name: "Konkani" },
  { code: "ml", name: "Malayalam" },
  { code: "mai", name: "Maithili" },
  { code: "mni", name: "Manipuri (Meitei)" },
  { code: "mr", name: "Marathi" },
  { code: "ne", name: "Nepali" },
  { code: "or", name: "Odia" },
  { code: "pa", name: "Punjabi" },
  { code: "sa", name: "Sanskrit" },
  { code: "sat", name: "Santali" },
  { code: "sd", name: "Sindhi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ur", name: "Urdu" },
] as const;

export type IndianLanguageCode = (typeof INDIAN_LANGUAGES_CATALOG)[number]["code"];

export function catalogNameForCode(code: string): string | undefined {
  const c = code.trim().toLowerCase();
  return INDIAN_LANGUAGES_CATALOG.find((row) => row.code === c)?.name;
}
