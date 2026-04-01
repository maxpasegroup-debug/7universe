"use client";

import { startTransition, useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

type LanguageRow = { id: string; name: string; code: string };
type ContentRow = {
  id: string;
  languageId: string;
  contentType: string;
  title: string;
  videoUrl: string;
  sortOrder: number;
};

const CONTENT_TYPES = ["orientation", "training", "advanced"] as const;

export default function AdminCmsContentPage() {
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    contentType: "orientation" as (typeof CONTENT_TYPES)[number],
    title: "",
    videoUrl: "",
    sortOrder: 0,
  });

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/admin/cms/languages");
          const data = (await res.json()) as { languages?: LanguageRow[] };
          const list = data.languages ?? [];
          setLanguages(list);
          setLanguageId((cur) => cur || list[0]?.id || "");
        } finally {
          setLoading(false);
        }
      })();
    });
  }, []);

  useEffect(() => {
    if (!languageId) return;
    startTransition(() => {
      void (async () => {
        const res = await fetch(`/api/admin/cms/contents?languageId=${encodeURIComponent(languageId)}`);
        const data = (await res.json()) as { contents?: ContentRow[] };
        setContents(data.contents ?? []);
      })();
    });
  }, [languageId]);

  async function createContent() {
    if (!languageId) return;
    setMessage(null);
    const res = await fetch("/api/admin/cms/contents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        languageId,
        contentType: form.contentType,
        title: form.title,
        videoUrl: form.videoUrl,
        sortOrder: form.sortOrder,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Create failed");
      return;
    }
    setForm((f) => ({ ...f, title: "", videoUrl: "", sortOrder: 0 }));
    const list = await fetch(`/api/admin/cms/contents?languageId=${encodeURIComponent(languageId)}`).then((r) =>
      r.json(),
    );
    setContents((list as { contents?: ContentRow[] }).contents ?? []);
    setMessage("Added.");
  }

  async function deleteContent(id: string) {
    if (!confirm("Delete this video entry?")) return;
    const res = await fetch(`/api/admin/cms/contents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Delete failed (may be assigned to a step)");
      return;
    }
    setContents((c) => c.filter((x) => x.id !== id));
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-slate-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Video library</h1>
      <p className="mt-1 text-sm text-slate-500">Content items referenced by video steps (orientation / training / advanced).</p>

      <div className="mt-6">
        <label className="text-sm text-slate-400">
          Language
          <select
            className="ml-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="mt-8 rounded-2xl border border-amber-500/15 bg-slate-950/50 p-4 sm:p-6">
        <h2 className="font-display text-lg text-amber-100">Add video</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-400">Type</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.contentType}
              onChange={(e) =>
                setForm((f) => ({ ...f, contentType: e.target.value as (typeof CONTENT_TYPES)[number] }))
              }
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-400">Title</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-400">Video URL or YouTube ID</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Sort order</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </label>
        </div>
        <div className="mt-4">
          <GlowButton type="button" onClick={() => void createContent()}>
            Add content
          </GlowButton>
        </div>
      </section>

      {message && <p className="mt-4 text-sm text-amber-200/90">{message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {contents.map((r) => (
              <tr key={r.id} className="border-b border-slate-800/80">
                <td className="px-4 py-3">{r.contentType}</td>
                <td className="px-4 py-3">{r.title}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-500">{r.videoUrl}</td>
                <td className="px-4 py-3">{r.sortOrder}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void deleteContent(r.id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
