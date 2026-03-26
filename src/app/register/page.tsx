"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createUser } from "@/lib/api/user-client";
import { getCopy, resolveLanguage } from "@/lib/i18n";
import {
  clearStoredReferrerId,
  getStoredLanguage,
  getStoredProfile,
  getStoredReferrerId,
  setStoredProfile,
} from "@/lib/storage";
import { isUuid } from "@/lib/validation";
import { SpaceBackground } from "@/components/layout/SpaceBackground";
import { RefCapture } from "@/components/referral/RefCapture";
import { GlowButton } from "@/components/ui/GlowButton";
import { Logo } from "@/components/ui/Logo";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFromUrl = searchParams.get("ref")?.trim() ?? "";

  const lang = resolveLanguage(getStoredLanguage());
  const c = getCopy(lang);
  const existing = useMemo(() => getStoredProfile(), []);
  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [storedRef, setStoredRef] = useState<string | null>(null);
  useEffect(() => {
    setStoredRef(getStoredReferrerId());
  }, []);

  const referrerUuid = useMemo(() => {
    if (rawFromUrl && isUuid(rawFromUrl)) return rawFromUrl;
    if (storedRef && isUuid(storedRef)) return storedRef;
    return null;
  }, [rawFromUrl, storedRef]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMobile = mobile.replace(/\s/g, "");
    if (!trimmedName) {
      setError(c.userForm.errorName);
      return;
    }
    if (!/^\d{10}$/.test(trimmedMobile)) {
      setError(c.userForm.errorMobile);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await createUser({
        name: trimmedName,
        mobile: trimmedMobile,
        language: lang,
        ...(referrerUuid ? { referrerId: referrerUuid } : {}),
      });
      setStoredProfile({
        id: res.userId,
        name: trimmedName,
        mobile: trimmedMobile,
      });
      if (referrerUuid) {
        clearStoredReferrerId();
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : c.userForm.submitError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SpaceBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-16 pt-10 sm:px-8">
        <div className="mb-8 flex justify-center">
          <Logo href="/language" size="md" />
        </div>
        <h1 className="font-display text-center text-2xl font-semibold text-slate-50 sm:text-3xl">{c.userForm.title}</h1>
        {referrerUuid && (
          <p className="mt-2 text-center text-xs text-amber-200/80">Referral link applied</p>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-10 flex flex-1 flex-col gap-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
              {c.userForm.nameLabel}
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.userForm.namePlaceholder}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700/90 bg-slate-950/50 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="mobile" className="mb-2 block text-sm font-medium text-slate-300">
              {c.userForm.mobileLabel}
            </label>
            <input
              id="mobile"
              name="mobile"
              inputMode="numeric"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder={c.userForm.mobilePlaceholder}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700/90 bg-slate-950/50 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="mt-auto flex justify-center pt-6">
            <GlowButton type="submit" disabled={loading} className="w-full max-w-xs">
              {loading ? c.dashboard.saving : c.userForm.continue}
            </GlowButton>
          </div>
        </form>
      </main>
    </SpaceBackground>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black text-slate-400">Loading…</div>
      }
    >
      <>
        <RefCapture />
        <RegisterForm />
      </>
    </Suspense>
  );
}
