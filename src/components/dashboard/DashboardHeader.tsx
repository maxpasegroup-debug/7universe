"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppIconButton } from "@/components/ui/WhatsAppIconButton";
import { performUserLogout } from "@/lib/auth/user-logout";
import { WHATSAPP_ONBOARDING_URL } from "@/lib/constants";

type Props = {
  /** Override default onboarding WhatsApp link if needed */
  whatsappHref?: string;
  logoutLabel: string;
  logoutConfirm: string;
};

export function DashboardHeader({
  whatsappHref = WHATSAPP_ONBOARDING_URL,
  logoutLabel,
  logoutConfirm,
}: Props) {
  const router = useRouter();

  async function handleLogout() {
    if (!window.confirm(logoutConfirm)) return;
    await performUserLogout();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 py-3 backdrop-blur-md sm:px-6">
      <Logo href="/dashboard" size="sm" />
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <WhatsAppIconButton href={whatsappHref} target="_blank" rel="noopener noreferrer" />
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex min-h-11 min-w-[2.75rem] items-center justify-center gap-1.5 rounded-xl border border-amber-500/35 bg-transparent px-3 text-sm font-medium text-amber-100/95 transition hover:border-amber-400/55 hover:bg-amber-500/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 active:scale-[0.98]"
          aria-label={logoutLabel}
        >
          <svg
            className="h-5 w-5 shrink-0 text-amber-200/90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">{logoutLabel}</span>
        </button>
      </div>
    </header>
  );
}
