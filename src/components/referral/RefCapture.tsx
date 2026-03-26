"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { isUuid } from "@/lib/validation";
import { setStoredReferrerId } from "@/lib/storage";

/** Persists `?ref=` (referrer user id) from the URL into localStorage for signup. */
export function RefCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("ref")?.trim();
    if (raw && isUuid(raw)) {
      setStoredReferrerId(raw);
    }
  }, [searchParams]);

  return null;
}
