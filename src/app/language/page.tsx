"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SpaceBackground } from "@/components/layout/SpaceBackground";
import { GlowButton } from "@/components/ui/GlowButton";
import { Logo } from "@/components/ui/Logo";
import { getCopy, LANGUAGE_OPTIONS, type LanguageCode } from "@/lib/i18n";
import { getStoredLanguage, setStoredLanguage } from "@/lib/storage";

export default function LanguagePage() {
  const router = useRouter();
  const initial = getStoredLanguage() ?? "en";
  const [selected, setSelected] = useState<LanguageCode>(initial);
  const c = getCopy(selected);

  function handleContinue() {
    setStoredLanguage(selected);
    router.push("/register");
  }

  return (
    <SpaceBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-24 pt-10 sm:px-8">
        <div className="mb-8 flex justify-center">
          <Logo href="/" size="md" />
        </div>
        <h1 className="font-display text-center text-2xl font-semibold text-slate-50 sm:text-3xl">
          {c.language.title}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">{c.language.subtitle}</p>

        <div className="mt-10 space-y-3" role="radiogroup" aria-label={c.language.title}>
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = selected === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(opt.code)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${
                  active
                    ? "border-amber-400/50 bg-amber-500/10 shadow-[0_0_24px_rgba(245,158,11,0.15)]"
                    : "border-slate-700/80 bg-slate-950/40 hover:border-slate-600"
                }`}
              >
                <span className="text-base font-medium text-slate-100">{opt.label}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-amber-400 bg-amber-400/20" : "border-slate-600"
                  }`}
                  aria-hidden
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex justify-center pt-10">
          <GlowButton className="w-full max-w-xs" onClick={handleContinue}>
            {c.language.continue}
          </GlowButton>
        </div>
      </main>
    </SpaceBackground>
  );
}
