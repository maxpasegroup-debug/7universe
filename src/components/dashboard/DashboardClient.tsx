"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  fetchProgress,
  fetchPublicContent,
  patchProgress,
  postConvert,
} from "@/lib/api/onboarding-client";
import { getAppPublicUrl } from "@/lib/app-url";
import { mergeContentOverrides } from "@/lib/content/merge";
import { JOIN_EXTERNAL_URL } from "@/lib/constants";
import { getCopy, getMediaForLanguage, resolveLanguage, type LanguageCode } from "@/lib/i18n";
import { mediaFromSettings } from "@/lib/media-from-settings";
import { getStoredLanguage, getStoredProfile, setStoredProfile } from "@/lib/storage";
import type { AppSettingsRow } from "@/types/app-settings";
import type { OnboardingProfilePublic } from "@/types/onboarding";
import { ChatbotFAB } from "@/components/dashboard/ChatbotFAB";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FloatingWhatsAppBar } from "@/components/dashboard/FloatingWhatsAppBar";
import { ProgressTracker } from "@/components/onboarding/ProgressTracker";
import { StepCard } from "@/components/onboarding/StepCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { MarkStepButton } from "@/components/ui/MarkStepButton";
import { PdfModal } from "@/components/ui/PdfModal";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

function getLangSnapshot(): LanguageCode {
  return resolveLanguage(getStoredLanguage());
}

function getLangServerSnapshot(): LanguageCode {
  return "en";
}

type SavingKey = "s1" | "s2" | "s3" | null;

export function DashboardClient() {
  const router = useRouter();
  const lang = useSyncExternalStore(() => () => {}, getLangSnapshot, getLangServerSnapshot);
  const baseCopy = getCopy(lang);

  const stored = useMemo(() => getStoredProfile(), []);
  const [settings, setSettings] = useState<AppSettingsRow | null>(null);
  const [apiProfile, setApiProfile] = useState<OnboardingProfilePublic | null>(null);

  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<SavingKey>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const c = useMemo(
    () => mergeContentOverrides(lang, baseCopy, settings?.content_overrides ?? {}),
    [lang, baseCopy, settings]
  );

  const media = useMemo(() => {
    if (settings) return mediaFromSettings(settings, lang);
    return getMediaForLanguage(lang);
  }, [settings, lang]);

  const joinLink = settings?.join_link?.trim() || JOIN_EXTERNAL_URL;

  const canStep2 = s1;
  const canStep3 = s1 && s2;
  const canStep4 = s1 && s2 && s3;

  const progressComplete: [boolean, boolean, boolean, boolean] = [s1, s2, s3, canStep4];

  const errorLoadMsg = c.dashboard.errorLoad;

  const load = useCallback(async () => {
    if (!stored?.id || !stored.mobile) return;
    try {
      const progRes = await fetchProgress(stored.id, stored.mobile);
      try {
        const contentRes = await fetchPublicContent();
        setSettings(contentRes.settings);
      } catch {
        /* CMS optional — fall back to static i18n media */
      }

      const row = progRes.profile;
      setApiProfile(row);
      setS1(row.step1_completed);
      setS2(row.step2_completed);
      setS3(row.step3_completed);
      setLoadError(null);
      if (row.name !== stored.name || row.mobile !== stored.mobile) {
        setStoredProfile({ id: row.id, name: row.name, mobile: row.mobile });
      }
    } catch {
      setLoadError(errorLoadMsg);
    }
  }, [stored, errorLoadMsg]);

  useEffect(() => {
    if (!stored?.id) {
      router.replace("/register");
      return;
    }
    void load();
  }, [stored?.id, router, load]);

  async function saveStep(key: SavingKey, payload: {
    step1_completed?: boolean;
    step2_completed?: boolean;
    step3_completed?: boolean;
  }) {
    if (!stored?.id) return;
    setSaving(key);
    setLoadError(null);
    try {
      const { profile: row } = await patchProgress({
        id: stored.id,
        mobile: stored.mobile,
        ...payload,
      });
      setApiProfile(row);
      setS1(row.step1_completed);
      setS2(row.step2_completed);
      setS3(row.step3_completed);
    } catch {
      setLoadError(c.dashboard.errorSave);
    } finally {
      setSaving(null);
    }
  }

  function scrollToStep1() {
    document.getElementById("step-1")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const referralUrl = apiProfile?.referral_code
    ? `${getAppPublicUrl()}/register?ref=${apiProfile.referral_code}`
    : "";

  async function copyReferral() {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function shareReferral() {
    if (!referralUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "7Universe", text: c.dashboard.referralHint, url: referralUrl });
      } else {
        await copyReferral();
      }
    } catch {
      /* user cancelled or error */
    }
  }

  function handleJoinClick() {
    if (!stored?.id) return;
    void postConvert(stored.id, stored.mobile).catch(() => {});
  }

  return (
    <>
      <DashboardHeader />

      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-40 pt-8 sm:px-6 sm:pb-44 sm:pt-10">
        <section className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-slate-950/90 via-[#0a1020] to-slate-900/50 p-6 shadow-[0_0_60px_rgba(245,158,11,0.08)] sm:p-10">
          <h1 className="font-display text-2xl font-bold leading-tight text-slate-50 sm:text-4xl">{c.dashboard.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{c.dashboard.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
            <span>
              {c.dashboard.leadScoreLabel}:{" "}
              <strong className="text-amber-200">{apiProfile?.lead_score ?? "—"}</strong>
            </span>
            <span>
              {c.dashboard.referralCountLabel}:{" "}
              <strong className="text-amber-200">{apiProfile?.referral_count ?? 0}</strong>
            </span>
          </div>
          <div className="mt-8">
            <GlowButton type="button" onClick={scrollToStep1} className="w-full max-w-xs sm:w-auto">
              {c.dashboard.activateCta}
            </GlowButton>
          </div>
        </section>

        {referralUrl && (
          <section className="rounded-2xl border border-amber-500/20 bg-slate-950/40 p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-amber-100">{c.dashboard.referralTitle}</h2>
            <p className="mt-2 text-sm text-slate-400">{c.dashboard.referralHint}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="block flex-1 break-all rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-amber-100/90">
                {referralUrl}
              </code>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void copyReferral()}
                  className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20"
                >
                  {copied ? c.dashboard.copied : c.dashboard.copyLink}
                </button>
                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                  <button
                    type="button"
                    onClick={() => void shareReferral()}
                    className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    {c.dashboard.shareLink}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <div>
          <h2 className="font-display mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
            {c.dashboard.progressTitle}
          </h2>
          <ProgressTracker labels={c.dashboard.progressSteps} completed={progressComplete} />
        </div>

        {loadError && (
          <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
            {loadError}
          </p>
        )}

        <div id="step-1" className="scroll-mt-28 space-y-8">
          <StepCard
            title={c.dashboard.step1Title}
            stepNumber={1}
            done={s1}
            doneLabel={c.dashboard.stepDone}
            actions={
              <MarkStepButton
                loading={saving === "s1"}
                disabled={s1}
                onClick={() => void saveStep("s1", { step1_completed: true })}
              >
                {saving === "s1" ? c.dashboard.saving : c.dashboard.step1Action}
              </MarkStepButton>
            }
          >
            <VideoEmbed videoId={media.orientationVideoId} title={c.dashboard.step1Title} />
          </StepCard>

          <StepCard
            title={c.dashboard.step2Title}
            stepNumber={2}
            done={s2}
            doneLabel={c.dashboard.stepDone}
            actions={
              <>
                <button
                  type="button"
                  disabled={!canStep2}
                  onClick={() => canStep2 && setPdfOpen(true)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {c.dashboard.step2ViewPdf}
                </button>
                <a
                  href={media.earningPdfUrl}
                  download
                  onClick={(e) => {
                    if (!canStep2) e.preventDefault();
                  }}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 ${
                    !canStep2 ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  {c.dashboard.step2Download}
                </a>
                <MarkStepButton
                  loading={saving === "s2"}
                  disabled={s2 || !canStep2}
                  onClick={() => void saveStep("s2", { step2_completed: true })}
                >
                  {saving === "s2" ? c.dashboard.saving : c.dashboard.step2Action}
                </MarkStepButton>
              </>
            }
          >
            {!canStep2 && <p className="text-xs text-slate-500">{c.dashboard.completePrevious}</p>}
          </StepCard>

          <StepCard
            title={c.dashboard.step3Title}
            stepNumber={3}
            done={s3}
            doneLabel={c.dashboard.stepDone}
            actions={
              <MarkStepButton
                loading={saving === "s3"}
                disabled={s3 || !canStep3}
                onClick={() => void saveStep("s3", { step3_completed: true })}
              >
                {saving === "s3" ? c.dashboard.saving : c.dashboard.step3Action}
              </MarkStepButton>
            }
          >
            {!canStep3 && <p className="text-xs text-slate-500">{c.dashboard.completePrevious}</p>}
            <VideoEmbed videoId={media.businessVideoId} title={c.dashboard.step3Title} />
          </StepCard>

          <StepCard
            title={c.dashboard.step4Title}
            stepNumber={4}
            done={false}
            doneLabel={c.dashboard.stepDone}
            actions={
              canStep4 ? (
                <a
                  href={joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleJoinClick}
                  className="glow-gold inline-flex w-full max-w-lg items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-center text-lg font-semibold text-black shadow-lg hover:brightness-110 sm:text-xl"
                >
                  {c.dashboard.joinCta}
                </a>
              ) : (
                <div className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-950/60 px-4 py-4 text-center text-sm text-slate-500">
                  {c.dashboard.step4Locked}
                </div>
              )
            }
          >
            {!canStep4 && <p className="text-xs text-slate-500">{c.dashboard.completePrevious}</p>}
          </StepCard>
        </div>
      </div>

      <PdfModal
        open={pdfOpen}
        title={c.dashboard.step2Title}
        pdfUrl={media.earningPdfUrl}
        onClose={() => setPdfOpen(false)}
        closeLabel={c.dashboard.closeModal}
      />

      <ChatbotFAB language={lang} />
      <FloatingWhatsAppBar label={c.dashboard.whatsAppBar} />
    </>
  );
}
