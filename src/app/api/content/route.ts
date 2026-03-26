import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSettingsRow } from "@/types/app-settings";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();

    if (error || !data) {
      console.error("[content]", error);
      return NextResponse.json({ error: "Content not configured" }, { status: 500 });
    }

    return NextResponse.json({ settings: data as AppSettingsRow });
  } catch (e) {
    console.error("[content]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
