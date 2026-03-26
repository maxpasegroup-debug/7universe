type Props = {
  labels: [string, string, string, string];
  completed: [boolean, boolean, boolean, boolean];
};

export function ProgressTracker({ labels, completed }: Props) {
  return (
    <div className="rounded-2xl border border-amber-500/15 bg-slate-950/50 p-4 sm:p-5">
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        {labels.map((label, i) => {
          const done = completed[i];
          const isLast = i === labels.length - 1;
          return (
            <li key={label} className="relative flex flex-1 flex-col items-center gap-2 text-center sm:min-w-0">
              {!isLast && (
                <div
                  className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-0.5 w-[calc(100%-2.5rem)] bg-slate-800 sm:block"
                  aria-hidden
                />
              )}
              <div
                className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                  done
                    ? "border-amber-400 bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-[0_0_16px_rgba(245,158,11,0.4)]"
                    : "border-slate-600 bg-slate-900/80 text-slate-400"
                }`}
              >
                {done ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`max-w-[7rem] text-[11px] font-medium leading-tight sm:text-xs ${
                  done ? "text-amber-100/95" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
