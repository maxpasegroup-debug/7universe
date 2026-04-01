"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalUsers: number;
  todaySignups: number;
  completedUsers: number;
  highIntentUsers: number;
  funnel: {
    totalUsers: number;
    step1Completed: number;
    step2Completed: number;
    step3Completed: number;
    completedUsers: number;
  };
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-500/15 bg-slate-950/50 p-5 shadow-inner">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-display mt-2 text-3xl font-bold text-amber-100">{value}</p>
    </div>
  );
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = (await res.json()) as Stats & { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Failed to load");
          return;
        }
        setStats(data);
      } catch {
        setError("Network error");
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-50">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">User progress, funnel, and signup velocity.</p>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>
      )}

      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={stats.totalUsers} />
          <StatCard label="Today signups" value={stats.todaySignups} />
          <StatCard label="Completed users" value={stats.completedUsers} />
          <StatCard label="High intent users" value={stats.highIntentUsers} />
        </div>
      )}

      {stats && (
        <section className="mt-8 rounded-2xl border border-amber-500/15 bg-slate-950/50 p-5">
          <h2 className="font-display text-lg text-amber-100">Funnel</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Signed up", value: stats.funnel.totalUsers },
              { label: "Step 1 completed", value: stats.funnel.step1Completed },
              { label: "Step 2 completed", value: stats.funnel.step2Completed },
              { label: "Step 3 completed", value: stats.funnel.step3Completed },
              { label: "Fully completed", value: stats.funnel.completedUsers },
            ].map((row) => {
              const base = Math.max(stats.funnel.totalUsers, 1);
              const width = Math.max(4, Math.round((row.value / base) * 100));
              return (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-500/70 to-orange-400/70"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
