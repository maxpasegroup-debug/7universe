"use client";

import { useEffect, useState } from "react";
import { toWhatsAppDigits } from "@/lib/phone";

type ProgressRow = {
  id: string;
  userId: string;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  score: number;
};

type UserRow = {
  id: string;
  name: string;
  mobile: string;
  country: string;
  language: string;
  createdAt: string;
  progress: ProgressRow | null;
  referralCount: number;
  referrerId: string | null;
};

const filters = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed (all steps)" },
  { value: "not_converted", label: "Not converted" },
  { value: "not_completed", label: "Not completed" },
  { value: "high_intent", label: "High intent (step 3)" },
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
          <p className="mt-1 text-sm text-slate-500">Funnel progress and lead score.</p>
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
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Steps</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Referrals</th>
              <th className="px-4 py-3">Referrer</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const p = u.progress;
              return (
                <tr key={u.id} className="border-b border-slate-800/80">
                  <td className="px-4 py-3 font-medium text-slate-100">{u.name}</td>
                  <td className="px-4 py-3">{u.mobile}</td>
                  <td className="px-4 py-3">{u.country}</td>
                  <td className="px-4 py-3">{u.language}</td>
                  <td className="px-4 py-3">
                    {p ? (
                      <>
                        {p.step1Completed ? "1" : "·"}/{p.step2Completed ? "2" : "·"}/
                        {p.step3Completed ? "3" : "·"}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-amber-200">{p?.score ?? "—"}</td>
                  <td className="px-4 py-3">{u.referralCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{u.referrerId ?? "—"}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/${toWhatsAppDigits(u.mobile)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-amber-500/30 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/10"
                    >
                      Chat
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && !error && <p className="px-4 py-8 text-center text-slate-500">No users match.</p>}
      </div>
    </div>
  );
}
