"use client";

import { startTransition, useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

type LanguageRow = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
};

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });

  async function refresh() {
    const res = await fetch("/api/admin/cms/languages");
    const data = (await res.json()) as { languages?: LanguageRow[] };
    setLanguages(data.languages ?? []);
  }

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, []);

  async function addLanguage() {
    setMessage(null);
    const res = await fetch("/api/admin/cms/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, code: form.code, isActive: true }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Failed");
      return;
    }
    setForm({ name: "", code: "" });
    await refresh();
    setMessage("Language added.");
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/cms/languages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) void refresh();
  }

  async function removeLanguage(id: string) {
    if (!confirm("Delete language and all its CMS content?")) return;
    const res = await fetch(`/api/admin/cms/languages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Delete failed");
      return;
    }
    void refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Languages</h1>
      <p className="mt-1 text-sm text-slate-500">Codes match user `language` on signup (e.g. en, ml, ta).</p>

      <section className="mt-8 rounded-2xl border border-amber-500/15 bg-slate-950/50 p-4 sm:p-6">
        <h2 className="font-display text-lg text-amber-100">Add language</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="Name"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            placeholder="code"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 sm:w-40"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toLowerCase() }))}
          />
          <GlowButton type="button" onClick={() => void addLanguage()}>
            Add
          </GlowButton>
        </div>
      </section>

      {message && <p className="mt-4 text-sm text-amber-200/90">{message}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.id} className="border-b border-slate-800/80">
                <td className="px-4 py-3 font-medium text-slate-100">{l.name}</td>
                <td className="px-4 py-3">{l.code}</td>
                <td className="px-4 py-3">{l.isActive ? "yes" : "no"}</td>
                <td className="space-x-3 px-4 py-3">
                  <button
                    type="button"
                    className="text-amber-200 hover:underline"
                    onClick={() => void toggleActive(l.id, l.isActive)}
                  >
                    Toggle
                  </button>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => void removeLanguage(l.id)}>
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
