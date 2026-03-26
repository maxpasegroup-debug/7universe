"use client";

import { useEffect, useState } from "react";
import type { AppSettingsRow } from "@/types/app-settings";
import { GlowButton } from "@/components/ui/GlowButton";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<AppSettingsRow | null>(null);
  const [overridesText, setOverridesText] = useState("{}");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = (await res.json()) as { settings?: AppSettingsRow; error?: string };
        if (!res.ok || !data.settings) {
          setMessage(data.error ?? "Load failed");
          return;
        }
        setSettings(data.settings);
        setOverridesText(JSON.stringify(data.settings.content_overrides ?? {}, null, 2));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    let overrides: Record<string, unknown> = {};
    try {
      overrides = JSON.parse(overridesText) as Record<string, unknown>;
    } catch {
      setMessage("Invalid JSON in content overrides");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step1_video_en: settings.step1_video_en,
          step1_video_ml: settings.step1_video_ml,
          step1_video_ta: settings.step1_video_ta,
          step3_video_en: settings.step3_video_en,
          step3_video_ml: settings.step3_video_ml,
          step3_video_ta: settings.step3_video_ta,
          pdf_url: settings.pdf_url,
          join_link: settings.join_link,
          content_overrides: overrides,
        }),
      });
      const data = (await res.json()) as { settings?: AppSettingsRow; error?: string };
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

  async function uploadPdf(file: File | null) {
    if (!file) return;
    setMessage(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { pdf_url?: string; error?: string; settings?: AppSettingsRow };
    if (!res.ok) {
      setMessage(data.error ?? "Upload failed");
      return;
    }
    if (data.settings) {
      setSettings(data.settings as AppSettingsRow);
      setMessage("PDF uploaded and URL updated.");
    }
  }

  if (loading || !settings) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-slate-400">
        {loading ? "Loading…" : "Could not load settings."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Content</h1>
      <p className="mt-1 text-sm text-slate-500">Videos, PDF, join link, and optional i18n JSON overrides.</p>

      <div className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {(["en", "ml", "ta"] as const).map((lang) => (
            <label key={lang} className="block text-sm">
              <span className="text-slate-400">Step 1 video ({lang})</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
                value={lang === "en" ? settings.step1_video_en : lang === "ml" ? settings.step1_video_ml : settings.step1_video_ta}
                onChange={(e) => {
                  const v = e.target.value;
                  setSettings((s) =>
                    s
                      ? {
                          ...s,
                          ...(lang === "en" ? { step1_video_en: v } : lang === "ml" ? { step1_video_ml: v } : { step1_video_ta: v }),
                        }
                      : s
                  );
                }}
              />
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["en", "ml", "ta"] as const).map((lang) => (
            <label key={lang} className="block text-sm">
              <span className="text-slate-400">Step 3 video ({lang})</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
                value={lang === "en" ? settings.step3_video_en : lang === "ml" ? settings.step3_video_ml : settings.step3_video_ta}
                onChange={(e) => {
                  const v = e.target.value;
                  setSettings((s) =>
                    s
                      ? {
                          ...s,
                          ...(lang === "en" ? { step3_video_en: v } : lang === "ml" ? { step3_video_ml: v } : { step3_video_ta: v }),
                        }
                      : s
                  );
                }}
              />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">PDF URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
            value={settings.pdf_url}
            onChange={(e) => setSettings((s) => (s ? { ...s, pdf_url: e.target.value } : s))}
          />
        </label>
        <div>
          <p className="text-sm text-slate-400">Upload PDF (replaces Storage file & updates URL)</p>
          <input
            type="file"
            accept="application/pdf"
            className="mt-2 text-sm text-slate-400"
            onChange={(e) => void uploadPdf(e.target.files?.[0] ?? null)}
          />
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">JOIN external link</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100"
            value={settings.join_link}
            onChange={(e) => setSettings((s) => (s ? { ...s, join_link: e.target.value } : s))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Text overrides (JSON — merge into i18n per locale)</span>
          <textarea
            className="mt-1 min-h-[200px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-100"
            value={overridesText}
            onChange={(e) => setOverridesText(e.target.value)}
          />
        </label>
        {message && <p className="text-sm text-amber-200/90">{message}</p>}
        <GlowButton type="button" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save changes"}
        </GlowButton>
      </div>
    </div>
  );
}
