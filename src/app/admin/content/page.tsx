"use client";

import { useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

type Language = "en" | "ml" | "ta";
type SettingsRow = {
  id: string;
  language: Language;
  step1VideoUrl: string;
  step2PdfUrl: string;
  step3VideoUrl: string;
  joinLink: string;
};

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SettingsRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = (await res.json()) as { settings?: SettingsRow[]; error?: string };
        if (!res.ok || !Array.isArray(data.settings)) {
          setMessage(data.error ?? "Load failed");
          return;
        }
        const byLang = new Map(data.settings.map((s) => [s.language, s]));
        const ordered: SettingsRow[] = (["en", "ml", "ta"] as const).map(
          (lang) =>
            byLang.get(lang) ?? {
              id: `${lang}-new`,
              language: lang,
              step1VideoUrl: "",
              step2PdfUrl: "",
              step3VideoUrl: "",
              joinLink: "",
            }
        );
        setSettings(ordered);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!settings.length) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
        }),
      });
      const data = (await res.json()) as { settings?: SettingsRow[]; error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      if (data.settings) setSettings(data.settings);
      setMessage("Saved.");
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Edit step videos, PDF, and join link per language.</p>

      <div className="mt-8 space-y-6">
        {settings.map((row) => (
          <section key={row.language} className="rounded-2xl border border-amber-500/15 bg-slate-950/50 p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-amber-100 uppercase">{row.language}</h2>
            <div className="mt-4 grid gap-4">
              <label className="block text-sm">
                <span className="text-slate-400">Step 1 video URL or YouTube ID</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
                  value={row.step1VideoUrl}
                  onChange={(e) =>
                    setSettings((all) =>
                      all.map((s) => (s.language === row.language ? { ...s, step1VideoUrl: e.target.value } : s))
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-400">Step 2 PDF URL</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
                  value={row.step2PdfUrl}
                  onChange={(e) =>
                    setSettings((all) =>
                      all.map((s) => (s.language === row.language ? { ...s, step2PdfUrl: e.target.value } : s))
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-400">Step 3 video URL or YouTube ID</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
                  value={row.step3VideoUrl}
                  onChange={(e) =>
                    setSettings((all) =>
                      all.map((s) => (s.language === row.language ? { ...s, step3VideoUrl: e.target.value } : s))
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-400">Join link</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
                  value={row.joinLink}
                  onChange={(e) =>
                    setSettings((all) =>
                      all.map((s) => (s.language === row.language ? { ...s, joinLink: e.target.value } : s))
                    )
                  }
                />
              </label>
            </div>
          </section>
        ))}
        {message && <p className="text-sm text-amber-200/90">{message}</p>}
        <GlowButton type="button" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save changes"}
        </GlowButton>
      </div>
    </div>
  );
}
