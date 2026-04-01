"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  fetchOnboardingJourney,
  fetchUserProgress,
  postUserStepComplete,
  type JourneyStep,
  type ProgressRow,
} from "@/lib/api/user-client";
import { getAppPublicUrl } from "@/lib/app-url";
import { getCopy, resolveLanguage } from "@/lib/i18n";
import { getStoredLanguage, getStoredProfile } from "@/lib/storage";
import { youtubeEmbedId } from "@/lib/youtube";
import { ChatbotFAB } from "@/components/dashboard/ChatbotFAB";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FloatingWhatsAppBar } from "@/components/dashboard/FloatingWhatsAppBar";
import { ProgressTracker } from "@/components/onboarding/ProgressTracker";
import { StepCard } from "@/components/onboarding/StepCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { MarkStepButton } from "@/components/ui/MarkStepButton";
import { PdfModal } from "@/components/ui/PdfModal";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

function getLangSnapshot(): string {
  return resolveLanguage(getStoredLanguage());
}

function getLangServerSnapshot(): string {
  return "en";
}

function isStepUnlocked(steps: JourneyStep[], completed: Set<string>, index: number): boolean {
  for (let i = 0; i < index; i++) {
    const p = steps[i];
    if ((p.kind === "video" || p.kind === "pdf") && !completed.has(p.id)) return false;
  }
  return true;
}

function trackerCompleted(steps: JourneyStep[], completed: Set<string>): boolean[] {
  return steps.map((s, i) => {
    if (s.kind === "video" || s.kind === "pdf") return completed.has(s.id);
    return isStepUnlocked(steps, completed, i);
  });
}

export function DashboardClient() {
  const router = useRouter();
  const lang = useSyncExternalStore(() => () => {}, getLangSnapshot, getLangServerSnapshot);
  const c = getCopy(lang);

  const stored = useMemo(() => getStoredProfile(), []);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [progress, setProgress] = useState<ProgressRow | null>(null);
  const [referralCount, setReferralCount] = useState(0);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingStepId, setSavingStepId] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const completed = useMemo(() => new Set(progress?.completedStepIds ?? []), [progress]);

  const errorLoadMsg = c.dashboard.errorLoad;

  const load = useCallback(async () => {
    if (!stored?.id || !stored.mobile) return;
    try {
      const [journey, progRes] = await Promise.all([
        fetchOnboardingJourney(lang),
        fetchUserProgress(stored.id),
      ]);

      const ordered = [...journey.steps].sort((a, b) => a.sortOrder - b.sortOrder);
      setSteps(ordered);
      setProgress(progRes.progress);
      setReferralCount(progRes.referralCount);
      setLoadError(null);
    } catch {
      setLoadError(errorLoadMsg);
    }
  }, [stored, errorLoadMsg, lang]);

  useEffect(() => {
    if (!stored?.id) {
      router.replace("/register");
      return;
    }
    void load();
  }, [stored?.id, router, load]);

  async function saveStepId(stepId: string) {
    if (!stored?.id) return;
    setSavingStepId(stepId);
    setLoadError(null);
    try {
      const row = await postUserStepComplete(stored.id, stepId);
      setProgress(row);
    } catch {
      setLoadError(c.dashboard.errorSave);
    } finally {
      setSavingStepId(null);
    }
  }

  function scrollToFirstStep() {
    document.getElementById("step-0")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const referralUrl = stored?.id ? `${getAppPublicUrl()}?ref=${encodeURIComponent(stored.id)}` : "";

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

  const trackerLabels = steps.map((s) => s.title);
  const trackerDone = trackerCompleted(steps, completed);

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
              <strong className="text-amber-200">{progress?.score ?? "—"}</strong>
            </span>
            <span>
              {c.dashboard.referralCountLabel}:{" "}
              <strong className="text-amber-200">{referralCount}</strong>
            </span>
          </div>
          <div className="mt-8">
            <GlowButton type="button" onClick={scrollToFirstStep} className="w-full max-w-xs sm:w-auto">
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

        {steps.length > 0 && (
          <div>
            <h2 className="font-display mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
              {c.dashboard.progressTitle}
            </h2>
            <ProgressTracker labels={trackerLabels} completed={trackerDone} />
          </div>
        )}

        {loadError && (
          <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
            {loadError}
          </p>
        )}

        <div className="scroll-mt-28 space-y-8">
          {steps.map((step, index) => {
            const unlocked = isStepUnlocked(steps, completed, index);
            const done = (step.kind === "video" || step.kind === "pdf") && completed.has(step.id);

            return (
              <div key={step.id} id={`step-${index}`} className="scroll-mt-28">
                <StepCard
                  title={step.title}
                  stepNumber={index + 1}
                  done={done}
                  doneLabel={c.dashboard.stepDone}
                  actions={
                    <>
                      {step.kind === "pdf" && step.pdfUrl && (
                        <>
                          <button
                            type="button"
                            disabled={!unlocked}
                            onClick={() => {
                              if (!unlocked) return;
                              setPdfTitle(step.title);
                              setPdfUrl(step.pdfUrl!);
                              setPdfOpen(true);
                            }}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {c.dashboard.step2ViewPdf}
                          </button>
                          <a
                            href={step.pdfUrl}
                            download
                            onClick={(e) => {
                              if (!unlocked) e.preventDefault();
                            }}
                            className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 ${
                              !unlocked ? "pointer-events-none opacity-40" : ""
                            }`}
                          >
                            {c.dashboard.step2Download}
                          </a>
                        </>
                      )}
                      {(step.kind === "video" || step.kind === "pdf") && (
                        <MarkStepButton
                          loading={savingStepId === step.id}
                          disabled={done || !unlocked}
                          onClick={() => void saveStepId(step.id)}
                        >
                          {savingStepId === step.id ? c.dashboard.saving : c.dashboard.markStepComplete}
                        </MarkStepButton>
                      )}
                      {step.kind === "action" && step.actionUrl && (
                        <>
                          {unlocked ? (
                            <a
                              href={step.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glow-gold inline-flex w-full max-w-lg items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-center text-lg font-semibold text-black shadow-lg hover:brightness-110 sm:text-xl"
                            >
                              {step.title?.trim() || c.dashboard.joinCta}
                            </a>
                          ) : (
                            <div className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-950/60 px-4 py-4 text-center text-sm text-slate-500">
                              {c.dashboard.step4Locked}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  }
                >
                  {!unlocked && (step.kind === "video" || step.kind === "pdf" || step.kind === "action") && (
                    <p className="text-xs text-slate-500">{c.dashboard.completePrevious}</p>
                  )}
                  {step.kind === "video" && step.videoUrl && (
                    <VideoEmbed videoId={youtubeEmbedId(step.videoUrl)} title={step.title} />
                  )}
                </StepCard>
              </div>
            );
          })}
        </div>
      </div>

      <PdfModal
        open={pdfOpen}
        title={pdfTitle}
        pdfUrl={pdfUrl}
        onClose={() => setPdfOpen(false)}
        closeLabel={c.dashboard.closeModal}
      />

      <ChatbotFAB language={lang} />
      <FloatingWhatsAppBar label={c.dashboard.whatsAppBar} />
    </>
  );
}
