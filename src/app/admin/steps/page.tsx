"use client";

import { startTransition, useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

type LanguageRow = { id: string; name: string; code: string };
type ContentOpt = { id: string; title: string; contentType: string };
type MaterialOpt = { id: string; title: string };
type StepRow = {
  id: string;
  title: string;
  stepType: string;
  sortOrder: number;
  contentId: string | null;
  materialId: string | null;
  actionUrl: string | null;
  content: { title: string } | null;
  material: { title: string } | null;
};

export default function AdminStepsPage() {
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [contents, setContents] = useState<ContentOpt[]>([]);
  const [materials, setMaterials] = useState<MaterialOpt[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    stepType: "video" as "video" | "pdf" | "action",
    sortOrder: 0,
    contentId: "",
    materialId: "",
    actionUrl: "",
  });

  async function loadLanguages() {
    const res = await fetch("/api/admin/cms/languages");
    const data = (await res.json()) as { languages?: LanguageRow[] };
    const list = data.languages ?? [];
    setLanguages(list);
    if (list[0] && !languageId) setLanguageId(list[0].id);
  }

  async function loadDeps(lid: string) {
    const [sRes, cRes, mRes] = await Promise.all([
      fetch(`/api/admin/cms/steps?languageId=${encodeURIComponent(lid)}`),
      fetch(`/api/admin/cms/contents?languageId=${encodeURIComponent(lid)}`),
      fetch(`/api/admin/cms/materials?languageId=${encodeURIComponent(lid)}`),
    ]);
    const sJson = (await sRes.json()) as { steps?: StepRow[] };
    const cJson = (await cRes.json()) as { contents?: ContentOpt[] };
    const mJson = (await mRes.json()) as { materials?: MaterialOpt[] };
    setSteps(sJson.steps ?? []);
    setContents(cJson.contents ?? []);
    setMaterials(mJson.materials ?? []);
  }

  useEffect(() => {
    startTransition(() => {
      void loadLanguages();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount bootstrap only
  }, []);

  useEffect(() => {
    if (!languageId) return;
    startTransition(() => {
      void loadDeps(languageId);
    });
  }, [languageId]);

  async function addStep() {
    if (!languageId) return;
    setMessage(null);
    const res = await fetch("/api/admin/cms/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        languageId,
        title: form.title,
        stepType: form.stepType,
        sortOrder: form.sortOrder,
        contentId: form.stepType === "video" ? form.contentId || null : null,
        materialId: form.stepType === "pdf" ? form.materialId || null : null,
        actionUrl: form.stepType === "action" ? form.actionUrl : null,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Failed");
      return;
    }
    setForm({
      title: "",
      stepType: "video",
      sortOrder: 0,
      contentId: "",
      materialId: "",
      actionUrl: "",
    });
    await loadDeps(languageId);
    setMessage("Step added.");
  }

  async function swapSteps(i: number, j: number) {
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j]!, next[i]!];
    const orderedIds = next.map((s) => s.id);
    const res = await fetch("/api/admin/cms/steps/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageId, orderedIds }),
    });
    if (res.ok) await loadDeps(languageId);
    else setMessage("Reorder failed");
  }

  async function deleteStep(id: string) {
    if (!confirm("Delete this step?")) return;
    const res = await fetch(`/api/admin/cms/steps/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Delete failed");
      return;
    }
    await loadDeps(languageId);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Step builder</h1>
      <p className="mt-1 text-sm text-slate-500">Ordered journey: assign video content, PDF material, or action URL.</p>

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
        <h2 className="font-display text-lg text-amber-100">Add step</h2>
        <div className="mt-4 grid gap-3">
          <input
            placeholder="Step title (shown to users)"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={form.stepType}
            onChange={(e) => setForm((f) => ({ ...f, stepType: e.target.value as typeof form.stepType }))}
          >
            <option value="video">video</option>
            <option value="pdf">pdf</option>
            <option value="action">action (join / external link)</option>
          </select>
          {form.stepType === "video" && (
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.contentId}
              onChange={(e) => setForm((f) => ({ ...f, contentId: e.target.value }))}
            >
              <option value="">Select video content…</option>
              {contents.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.contentType}] {c.title}
                </option>
              ))}
            </select>
          )}
          {form.stepType === "pdf" && (
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.materialId}
              onChange={(e) => setForm((f) => ({ ...f, materialId: e.target.value }))}
            >
              <option value="">Select material…</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}
          {form.stepType === "action" && (
            <input
              placeholder="https://… (join link)"
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.actionUrl}
              onChange={(e) => setForm((f) => ({ ...f, actionUrl: e.target.value }))}
            />
          )}
          <label className="text-sm text-slate-400">
            Sort order (hint)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </label>
          <GlowButton type="button" onClick={() => void addStep()}>
            Add step
          </GlowButton>
        </div>
      </section>

      {message && <p className="mt-4 text-sm text-amber-200/90">{message}</p>}

      <div className="mt-8 space-y-3">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-100">
                {i + 1}. {s.title}{" "}
                <span className="text-xs font-normal text-amber-200/80">({s.stepType})</span>
              </p>
              <p className="text-xs text-slate-500">
                {s.content && `Video: ${s.content.title}`}
                {s.material && `PDF: ${s.material.title}`}
                {s.actionUrl && `→ ${s.actionUrl}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-2 py-1 text-xs"
                onClick={() => void swapSteps(i, i - 1)}
              >
                Up
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-2 py-1 text-xs"
                onClick={() => void swapSteps(i, i + 1)}
              >
                Down
              </button>
              <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => void deleteStep(s.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
