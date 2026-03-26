"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/admin/login";

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#020008] via-[#050a18] to-[#0b1028] text-slate-100">
      {!hideNav && <AdminNav />}
      {children}
    </div>
  );
}
