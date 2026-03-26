"use client";

import { useEffect, useState } from "react";

type Stats = {
  total_users: number;
  conversions: number;
  drop_off_no_step1: number;
  high_intent_users: number;
  avg_lead_score: number;
  referral_signups: number;
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
      <p className="mt-1 text-sm text-slate-500">Funnel health and engagement at a glance.</p>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>
      )}

      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total users" value={stats.total_users} />
          <StatCard label="Conversions (joined)" value={stats.conversions} />
          <StatCard label="Drop-off (no step 1)" value={stats.drop_off_no_step1} />
          <StatCard label="High intent" value={stats.high_intent_users} />
          <StatCard label="Avg lead score" value={stats.avg_lead_score} />
          <StatCard label="Referral signups" value={stats.referral_signups} />
        </div>
      )}
    </div>
  );
}
