"use client";

import { useEffect, useState } from "react";

type ProgressRow = {
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
};

type UserRow = {
  id: string;
  name: string;
  mobile: string;
  language: string;
  createdAt: string;
  progress: ProgressRow | null;
};

const filters = [
  { value: "all", label: "All users" },
  { value: "completed", label: "Completed" },
  { value: "not_completed", label: "Not completed" },
  { value: "high_intent", label: "High intent" },
] as const;

function progressLabel(p: ProgressRow | null): string {
  if (!p) return "—";
  const s1 = p.step1Completed ? "1" : "·";
  const s2 = p.step2Completed ? "2" : "·";
  const s3 = p.step3Completed ? "3" : "·";
  return `${s1}/${s2}/${s3}`;
}

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setError(null);
      try {
        const q = filter === "all" ? "" : `?filter=${filter}`;
        const res = await fetch(`/api/admin/users${q}`);
        const data = (await res.json()) as { users?: UserRow[]; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Failed");
          return;
        }
        setUsers(data.users ?? []);
      } catch {
        setError("Network error");
      }
    })();
  }, [filter]);

  async function copyMobile(mobile: string, userId: string) {
    try {
      await navigator.clipboard.writeText(mobile);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-50">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Name, mobile, language, and step progress.</p>
        </div>
        <label className="text-sm text-slate-400">
          Filter
          <select
            className="ml-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            {filters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-amber-500/15 bg-slate-950/50">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-800/80">
                <td className="px-4 py-3 font-medium text-slate-100">{u.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">{u.mobile}</span>
                    <button
                      type="button"
                      onClick={() => void copyMobile(u.mobile, u.id)}
                      className="rounded-md border border-amber-500/35 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/10"
                    >
                      {copiedId === u.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">{u.language}</td>
                <td className="px-4 py-3 text-slate-200">{progressLabel(u.progress)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !error && <p className="px-4 py-8 text-center text-slate-500">No users match.</p>}
      </div>
    </div>
  );
}
