import type { Copy, LanguageCode } from "@/lib/i18n";

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = out[key];
    if (isPlainObject(pv) && isPlainObject(bv)) {
      out[key] = deepMerge(bv, pv);
    } else if (pv !== undefined) {
      out[key] = pv;
    }
  }
  return out as T;
}

/** Merges DB `content_overrides` JSON into static i18n copy for one language. */
export function mergeContentOverrides(lang: LanguageCode, base: Copy, overridesRoot: unknown): Copy {
  if (!overridesRoot || typeof overridesRoot !== "object") return base;
  const patch = (overridesRoot as Record<string, unknown>)[lang];
  if (!patch || typeof patch !== "object") return base;
  return deepMerge(base as unknown as Record<string, unknown>, patch as Record<string, unknown>) as Copy;
}
