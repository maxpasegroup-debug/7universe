"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  mobile: string;
  language: string;
  step1_completed: boolean;
  step2_completed: boolean;
  step3_completed: boolean;
  converted: boolean;
  high_intent: boolean;
  lead_score: number;
  referral_code: string | null;
  referrer_id: string | null;
  created_at: string;
  last_activity_at: string;
};

const filters = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed funnel" },
  { value: "not_converted", label: "Finished steps, not converted" },
  { value: "high_intent", label: "High intent" },
] as const;

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-50">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Lead scores and funnel progress.</p>
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

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Steps</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Conv.</th>
              <th className="px-4 py-3">Ref code</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-800/80">
                <td className="px-4 py-3 font-medium text-slate-100">{u.name}</td>
                <td className="px-4 py-3">{u.mobile}</td>
                <td className="px-4 py-3">{u.language}</td>
                <td className="px-4 py-3">
                  {u.step1_completed ? "1" : "·"}/
                  {u.step2_completed ? "2" : "·"}/
                  {u.step3_completed ? "3" : "·"}
                </td>
                <td className="px-4 py-3 text-amber-200">{u.lead_score}</td>
                <td className="px-4 py-3">{u.converted ? "Yes" : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.referral_code ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !error && <p className="px-4 py-8 text-center text-slate-500">No users match.</p>}
      </div>
    </div>
  );
}
