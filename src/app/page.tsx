import { Suspense } from "react";
import { SpaceBackground } from "@/components/layout/SpaceBackground";
import { RefCapture } from "@/components/referral/RefCapture";
import { Logo } from "@/components/ui/Logo";
import { GlowLink } from "@/components/ui/GlowButton";

export default function SplashPage() {
  return (
    <SpaceBackground>
      <Suspense fallback={null}>
        <RefCapture />
      </Suspense>
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-10 flex flex-col items-center gap-6">
          <Logo size="lg" className="justify-center" />
          <p className="max-w-md text-lg text-slate-300 sm:text-xl">Welcome to 7Universe</p>
        </div>
        <GlowLink href="/language" className="w-full max-w-xs">
          Enter
        </GlowLink>
      </main>
    </SpaceBackground>
  );
}
