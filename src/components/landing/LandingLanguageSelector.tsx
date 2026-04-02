"use client";

import { useEffect, useMemo, useState } from "react";
import { INDIAN_LANGUAGES_CATALOG } from "@/lib/languages-catalog";
import { getStoredLanguage, setStoredLanguage } from "@/lib/storage";

type LanguageOption = {
  code: string;
  name: string;
};

const FALLBACK_OPTIONS: LanguageOption[] = INDIAN_LANGUAGES_CATALOG.map(({ code, name }) => ({ code, name }));

export function LandingLanguageSelector() {
  const [options, setOptions] = useState<LanguageOption[]>(FALLBACK_OPTIONS);
  const [selected, setSelected] = useState<string>(() => getStoredLanguage() ?? "en");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/public/languages", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { languages?: LanguageOption[] };
        if (!cancelled && Array.isArray(data.languages) && data.languages.length > 0) {
          setOptions(data.languages);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const safeSelected = useMemo(() => {
    if (options.some((o) => o.code === selected)) return selected;
    return options[0]?.code ?? "en";
  }, [options, selected]);

  useEffect(() => {
    setStoredLanguage(safeSelected);
  }, [safeSelected]);

  return (
    <label className="block">
      <span className="mb-2 block text-left text-xs uppercase tracking-[0.16em] text-slate-400">Language</span>
      <select
        value={safeSelected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-xl border border-amber-400/25 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-0 transition focus:border-amber-400/50 focus:shadow-[0_0_0_2px_rgba(251,191,36,0.2)]"
        aria-label="Choose language"
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>
  );
}
