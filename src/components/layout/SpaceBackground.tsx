import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function SpaceBackground({ children, className = "" }: Props) {
  return (
    <div className={`relative min-h-dvh ${className}`}>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#020008] via-[#050a18] to-[#0b1028]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,rgba(245,158,11,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_90%,rgba(76,29,149,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_85%_100%,rgba(59,130,246,0.1),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-stars opacity-70" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
