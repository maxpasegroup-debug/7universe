"use client";

import { startTransition, useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

type LanguageRow = { id: string; name: string; code: string };
type MaterialRow = {
  id: string;
  languageId: string;
  title: string;
  fileUrl: string;
  materialType: string;
};

export default function AdminMaterialsPage() {
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", fileUrl: "", materialType: "pdf" as "pdf" | "link" });

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/admin/cms/languages");
        const data = (await res.json()) as { languages?: LanguageRow[] };
        const list = data.languages ?? [];
        setLanguages(list);
        setLanguageId((cur) => cur || list[0]?.id || "");
      })();
    });
  }, []);

  useEffect(() => {
    if (!languageId) return;
    startTransition(() => {
      void (async () => {
        const res = await fetch(`/api/admin/cms/materials?languageId=${encodeURIComponent(languageId)}`);
        const data = (await res.json()) as { materials?: MaterialRow[] };
        setMaterials(data.materials ?? []);
      })();
    });
  }, [languageId]);

  async function addMaterial() {
    if (!languageId) return;
    setMessage(null);
    const res = await fetch("/api/admin/cms/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        languageId,
        title: form.title,
        fileUrl: form.fileUrl,
        materialType: form.materialType,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Failed");
      return;
    }
    setForm({ title: "", fileUrl: "", materialType: "pdf" });
    const list = await fetch(`/api/admin/cms/materials?languageId=${encodeURIComponent(languageId)}`).then((r) =>
      r.json(),
    );
    setMaterials((list as { materials?: MaterialRow[] }).materials ?? []);
    setMessage("Added.");
  }

  async function deleteMaterial(id: string) {
    if (!confirm("Delete material?")) return;
    const res = await fetch(`/api/admin/cms/materials/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Delete failed (may be used by a step)");
      return;
    }
    setMaterials((m) => m.filter((x) => x.id !== id));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Materials</h1>
      <p className="mt-1 text-sm text-slate-500">PDFs or external links for pdf-type steps.</p>

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
        <h2 className="font-display text-lg text-amber-100">Add material</h2>
        <div className="mt-4 grid gap-3">
          <input
            placeholder="Title"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            placeholder="File or link URL"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={form.fileUrl}
            onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={form.materialType}
            onChange={(e) => setForm((f) => ({ ...f, materialType: e.target.value as "pdf" | "link" }))}
          >
            <option value="pdf">pdf</option>
            <option value="link">link</option>
          </select>
          <GlowButton type="button" onClick={() => void addMaterial()}>
            Add material
          </GlowButton>
        </div>
      </section>

      {message && <p className="mt-4 text-sm text-amber-200/90">{message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b border-slate-800/80">
                <td className="px-4 py-3">{m.title}</td>
                <td className="px-4 py-3">{m.materialType}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs">{m.fileUrl}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-red-400 hover:underline" onClick={() => void deleteMaterial(m.id)}>
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
