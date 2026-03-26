import { Logo } from "@/components/ui/Logo";
import { WhatsAppIconButton } from "@/components/ui/WhatsAppIconButton";
import { WHATSAPP_ONBOARDING_URL } from "@/lib/constants";

type Props = {
  /** Override default onboarding WhatsApp link if needed */
  whatsappHref?: string;
};

export function DashboardHeader({ whatsappHref = WHATSAPP_ONBOARDING_URL }: Props) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 py-3 backdrop-blur-md sm:px-6">
      <Logo href="/dashboard" size="sm" />
      <WhatsAppIconButton href={whatsappHref} target="_blank" rel="noopener noreferrer" />
    </header>
  );
}
