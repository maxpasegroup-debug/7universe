"use client";

import { useState } from "react";
import type { LanguageCode } from "@/lib/i18n";
import { getCopy } from "@/lib/i18n";

type Props = {
  language: LanguageCode;
};

export function ChatbotFAB({ language }: Props) {
  const [open, setOpen] = useState(false);
  const { dashboard, faq } = getCopy(language);
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <>
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-[calc(6rem+env(safe-area-inset-bottom))]">
        {open && (
          <div
            className="mb-3 w-[min(100vw-2rem,22rem)] rounded-2xl border border-amber-500/25 bg-slate-950/95 p-4 shadow-2xl shadow-amber-900/20 backdrop-blur-md"
            role="dialog"
            aria-label={dashboard.chatTitle}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-sm font-semibold text-amber-100">{dashboard.chatTitle}</p>
                <p className="text-xs text-slate-400">{dashboard.chatHint}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="max-h-[50dvh] space-y-2 overflow-y-auto pr-1">
              {faq.map((item, i) => {
                const isOpen = expanded === i;
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-left text-sm text-slate-100 hover:border-amber-500/30"
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span className="text-amber-400/90">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <p className="mt-1 rounded-xl border border-slate-800 bg-black/30 px-3 py-2 text-xs leading-relaxed text-slate-300">
                        {item.a}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-[0_0_24px_rgba(245,158,11,0.45)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
          aria-label={open ? "Close help" : "Open help"}
        >
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    </>
  );
}
