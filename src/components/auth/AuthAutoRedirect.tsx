"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getStoredProfile } from "@/lib/storage";

export function AuthAutoRedirect() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredProfile();
    if (stored?.id) {
      router.replace("/dashboard");
    }
  }, [router]);

  return null;
}
