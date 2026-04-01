"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { checkMobileAccount, createUser, loginWithPin } from "@/lib/api/user-client";
import { getCopy, resolveLanguage } from "@/lib/i18n";
import {
  clearStoredProfile,
  clearStoredReferrerId,
  getStoredLanguage,
  getStoredReferrerId,
  setStoredProfile,
} from "@/lib/storage";
import {
  isUuid,
  isValid4DigitPin,
  isValidInternationalMobile,
  normalizeInternationalMobile,
} from "@/lib/validation";
import { AuthAutoRedirect } from "@/components/auth/AuthAutoRedirect";
import { SpaceBackground } from "@/components/layout/SpaceBackground";
import { RefCapture } from "@/components/referral/RefCapture";
import { GlowButton } from "@/components/ui/GlowButton";
import { InternationalPhoneInput } from "@/components/ui/InternationalPhoneInput";
import { Logo } from "@/components/ui/Logo";

type Mode = "mobile" | "register" | "login";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFromUrl = searchParams.get("ref")?.trim() ?? "";

  const lang = resolveLanguage(getStoredLanguage());
  const c = getCopy(lang);
  const [mode, setMode] = useState<Mode>("mobile");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [storedRef, setStoredRef] = useState<string | null>(null);
  useEffect(() => {
    if (!getStoredLanguage()) {
      router.replace("/");
      return;
    }
    setStoredRef(getStoredReferrerId());
  }, [router]);

  const referrerUuid = useMemo(() => {
    if (rawFromUrl && isUuid(rawFromUrl)) return rawFromUrl;
    if (storedRef && isUuid(storedRef)) return storedRef;
    return null;
  }, [rawFromUrl, storedRef]);

  function mapSubmitErrorMessage(raw: string): string {
    if (raw === "Invalid number") return c.userForm.errorInvalidNumber;
    if (raw === "Invalid PIN" || raw === "PIN must be exactly 4 digits") return "Please enter a valid 4-digit PIN.";
    if (raw === "Server error") return c.userForm.errorServer;
    return raw;
  }

  function normalizedMobile(): string {
    const digits = phoneDigits.replace(/\D/g, "");
    return normalizeInternationalMobile(`+${digits}`);
  }

  async function handleCheckMobile(e: React.FormEvent) {
    e.preventDefault();
    const e164 = normalizedMobile();
    if (!isValidInternationalMobile(e164)) {
      setNotice(null);
      setError(c.userForm.errorInvalidNumber);
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await checkMobileAccount(e164);
      if (res.accountExists) {
        setMode("login");
        setNotice("This number already exists. Please continue with your PIN.");
      } else {
        setMode("register");
        setNotice("New number detected. Create your account with a 4-digit PIN.");
      }
    } catch (err) {
      setError(mapSubmitErrorMessage(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const e164 = normalizedMobile();

    if (!trimmedName) {
      setNotice(null);
      setError(c.userForm.errorName);
      return;
    }
    if (!isValidInternationalMobile(e164)) {
      setNotice(null);
      setError(c.userForm.errorInvalidNumber);
      return;
    }
    if (!isValid4DigitPin(pin)) {
      setNotice(null);
      setError("Please enter a valid 4-digit PIN.");
      return;
    }

    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const res = await createUser({
        name: trimmedName,
        mobile: e164,
        language: lang,
        pin,
        ...(referrerUuid ? { referrerId: referrerUuid } : {}),
      });
      setStoredProfile({
        id: res.userId,
        name: trimmedName,
        mobile: e164,
      });
      if (referrerUuid) {
        clearStoredReferrerId();
      }
      if (res.created === false) {
        setMode("login");
        setNotice("This number already exists. Please continue with your PIN.");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setError(mapSubmitErrorMessage(raw) || c.userForm.submitError);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const e164 = normalizedMobile();
    if (!isValidInternationalMobile(e164)) {
      setError(c.userForm.errorInvalidNumber);
      return;
    }
    if (!isValid4DigitPin(pin)) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await loginWithPin(e164, pin);
      setStoredProfile({
        id: res.user.id,
        name: res.user.name,
        mobile: res.user.mobile,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(mapSubmitErrorMessage(err instanceof Error ? err.message : "") || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    clearStoredProfile();
    setMode("mobile");
    setName("");
    setPin("");
    setError(null);
    setNotice(null);
  }

  return (
    <SpaceBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-16 pt-10 sm:px-8">
        <div className="mb-8 flex justify-center">
          <Logo href="/" size="md" />
        </div>
        <h1 className="font-display text-center text-2xl font-semibold text-slate-50 sm:text-3xl">{c.userForm.title}</h1>
        {referrerUuid && (
          <p className="mt-2 text-center text-xs text-amber-200/80">Referral link applied</p>
        )}

        <form
          onSubmit={(e) => {
            if (mode === "mobile") return void handleCheckMobile(e);
            if (mode === "register") return void handleRegister(e);
            return void handleLogin(e);
          }}
          className="mt-10 flex flex-1 flex-col gap-5"
        >
          <div>
            <label htmlFor="mobile" className="mb-2 block text-sm font-medium text-slate-300">
              {c.userForm.mobileLabel}
            </label>
            <InternationalPhoneInput
              value={phoneDigits}
              onChange={setPhoneDigits}
              disabled={loading}
              placeholder={c.userForm.mobilePlaceholder}
            />
          </div>
          {mode === "register" && (
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
          )}
          {(mode === "register" || mode === "login") && (
            <div>
              <label htmlFor="pin" className="mb-2 block text-sm font-medium text-slate-300">
                4-digit PIN
              </label>
              <input
                id="pin"
                name="pin"
                value={pin}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Enter 4-digit PIN"
                disabled={loading}
                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/50 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
              />
            </div>
          )}
          {notice && (
            <p className="text-sm text-amber-200/90" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="mt-auto flex justify-center pt-6">
            <GlowButton type="submit" disabled={loading} className="w-full max-w-xs">
              {loading
                ? c.dashboard.saving
                : mode === "mobile"
                  ? "Continue"
                  : mode === "register"
                    ? "Create Account"
                    : "Login"}
            </GlowButton>
          </div>
          {mode !== "mobile" && (
            <button
              type="button"
              onClick={resetFlow}
              className="mx-auto text-xs text-slate-400 underline-offset-4 transition hover:text-amber-200 hover:underline"
            >
              Use a different number
            </button>
          )}
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
        <AuthAutoRedirect />
        <RefCapture />
        <RegisterForm />
      </>
    </Suspense>
  );
}
