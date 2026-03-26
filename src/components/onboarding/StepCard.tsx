import type { ReactNode } from "react";

type Props = {
  title: string;
  stepNumber: number;
  done: boolean;
  doneLabel: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function StepCard({ title, stepNumber, done, doneLabel, children, actions }: Props) {
  return (
    <section
      className={`rounded-2xl border bg-slate-950/40 p-4 shadow-inner backdrop-blur-sm sm:p-6 ${
        done ? "border-amber-500/35 ring-1 ring-amber-500/15" : "border-slate-700/50"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-display text-base font-semibold tracking-wide text-amber-100/95 sm:text-lg">
          <span className="mr-2 text-amber-500/80">0{stepNumber}</span>
          {title}
        </h2>
        {done && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
            {doneLabel}
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
      {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}
