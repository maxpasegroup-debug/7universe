import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
};

export function MarkStepButton({ children, loading, disabled, className = "", ...rest }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex min-h-11 min-w-[10rem] items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.08)] transition hover:from-amber-500/25 hover:to-orange-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-300" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
