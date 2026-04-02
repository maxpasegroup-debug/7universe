import { INDIAN_LANGUAGES_CATALOG } from "@/lib/languages-catalog";
import { prisma } from "@/lib/prisma";

/** Creates missing catalog language rows (active). Existing rows are left unchanged. */
export async function ensureDefaultLanguageRowsExist(): Promise<void> {
  const existing = await prisma.language.findMany({ select: { code: true } });
  const have = new Set(existing.map((r) => r.code));

  for (const { code, name } of INDIAN_LANGUAGES_CATALOG) {
    if (have.has(code)) continue;
    await prisma.language.upsert({
      where: { code },
      create: { name, code, isActive: true },
      update: { name, isActive: true },
    });
    have.add(code);
  }
}

async function resolveToEnglishCode(logSuffix: string): Promise<string> {
  const activeEn = await prisma.language.findFirst({
    where: { code: "en", isActive: true },
    select: { code: true },
  });
  if (activeEn) return activeEn.code;

  const anyEn = await prisma.language.findUnique({
    where: { code: "en" },
    select: { code: true },
  });
  if (anyEn) {
    console.warn(`[language] English row exists but is inactive; storing "en" on user.${logSuffix}`);
    return "en";
  }

  console.warn(`[language] No English row in DB; using literal "en".${logSuffix}`);
  return "en";
}

type ResolveOpts = { requestId?: string };

/**
 * Resolve signup language without blocking registration:
 * - findUnique by code (active → use it; inactive → fallback English)
 * - missing code / unknown code → fallback English
 * Never throws for language reasons.
 */
export async function resolveSignupLanguageCode(rawRequested: string, opts?: ResolveOpts): Promise<string> {
  const logSuffix = opts?.requestId ? ` requestId=${opts.requestId}` : "";

  await ensureDefaultLanguageRowsExist();

  const requested = typeof rawRequested === "string" ? rawRequested.trim().toLowerCase() : "";
  if (!requested) {
    console.info(`[language] No language in request; falling back to English.${logSuffix}`);
    return resolveToEnglishCode(logSuffix);
  }

  const lang = await prisma.language.findUnique({
    where: { code: requested },
    select: { code: true, isActive: true },
  });

  if (!lang) {
    console.warn(`[language] Unknown language code "${requested}"; falling back to English.${logSuffix}`);
    return resolveToEnglishCode(logSuffix);
  }

  if (!lang.isActive) {
    console.warn(`[language] Language "${requested}" is inactive; falling back to English.${logSuffix}`);
    return resolveToEnglishCode(logSuffix);
  }

  return lang.code;
}
