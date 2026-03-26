import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function SectionShell({ title, children }: Props) {
  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4 shadow-inner backdrop-blur-sm sm:p-6">
      <h2 className="font-display mb-4 text-lg font-semibold tracking-wide text-amber-200/95 sm:text-xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
