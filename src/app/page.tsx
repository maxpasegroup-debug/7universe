import { Suspense } from "react";
import { AuthAutoRedirect } from "@/components/auth/AuthAutoRedirect";
import { SpaceBackground } from "@/components/layout/SpaceBackground";
import { LandingFeatureChips } from "@/components/landing/LandingFeatureChips";
import { LandingLanguageSelector } from "@/components/landing/LandingLanguageSelector";
import { RefCapture } from "@/components/referral/RefCapture";
import { Logo } from "@/components/ui/Logo";
import { GlowLink } from "@/components/ui/GlowButton";

export default function SplashPage() {
  return (
    <SpaceBackground className="overflow-hidden">
      <Suspense fallback={null}>
        <AuthAutoRedirect />
        <RefCapture />
      </Suspense>
      <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <div className="landing-orb-pulse pointer-events-none absolute left-1/2 top-[12%] z-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.26)_0%,rgba(245,158,11,0.10)_38%,transparent_72%)] blur-xl" />
        <div className="landing-float-slow pointer-events-none absolute right-[-5%] top-[22%] z-0 h-28 w-28 rounded-full border border-amber-400/20 bg-amber-300/5 blur-[1px]" />
        <div className="landing-star-twinkle pointer-events-none absolute left-[10%] top-[18%] z-0 h-1.5 w-1.5 rounded-full bg-amber-200/70" />
        <div className="landing-star-twinkle pointer-events-none absolute right-[14%] top-[30%] z-0 h-1 w-1 rounded-full bg-slate-100/80 [animation-delay:1.1s]" />

        <div className="landing-animate-in landing-delay-1 relative z-10 mb-5 flex flex-col items-center gap-2">
          <Logo size="md" className="justify-center" />
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/75">Learn • Earn • Grow</p>
        </div>

        <div className="landing-animate-in landing-delay-2 relative z-10 px-1">
          <h1 className="font-display text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl">
            Welcome to 7Universe
          </h1>
          <p className="mt-3 text-base text-slate-300 sm:text-lg">Start your journey in your chosen language</p>
          <p className="mt-2 text-sm text-slate-400">Simple onboarding. Clear guidance. Fast access.</p>
        </div>

        <section className="landing-animate-in landing-delay-3 relative z-10 mt-7 w-full max-w-md rounded-3xl border border-amber-400/20 bg-slate-950/45 p-4 backdrop-blur-xl sm:p-5">
          <div className="landing-shimmer-border pointer-events-none absolute inset-0 rounded-3xl opacity-25" aria-hidden />
          <div className="relative z-10 space-y-3">
            <LandingLanguageSelector />
            <GlowLink href="/register" className="landing-cta-pulse-glow w-full text-base">
              Enter
            </GlowLink>
          </div>
        </section>

        <LandingFeatureChips />

        <p className="landing-animate-in landing-delay-5 landing-scroll-hint mt-5 text-xs tracking-[0.2em] text-slate-500">
          Scroll to continue
        </p>
      </main>
    </SpaceBackground>
  );
}
