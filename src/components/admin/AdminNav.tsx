"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="font-display text-lg font-bold tracking-tight text-amber-200">7Universe Admin</span>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || (l.href === "/admin" && pathname === "/admin");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-amber-500/15 text-amber-100" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => void logout()}
            className="ml-2 rounded-lg border border-amber-500/30 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/10"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
