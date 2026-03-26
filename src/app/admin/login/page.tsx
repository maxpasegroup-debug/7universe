"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="mb-10">
        <Logo href="/" size="md" />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-slate-950/60 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <h1 className="font-display text-center text-xl font-semibold text-amber-100">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Enter the admin password from your environment.</p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <GlowButton type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </GlowButton>
        </form>
      </div>
    </main>
  );
}
