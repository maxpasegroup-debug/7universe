import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/require-admin";
import type { AppSettingsRow } from "@/types/app-settings";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ settings: data as AppSettingsRow });
  } catch (e) {
    console.error("[admin/settings GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

type PatchBody = Partial<
  Pick<
    AppSettingsRow,
    | "step1_video_en"
    | "step1_video_ml"
    | "step1_video_ta"
    | "step3_video_en"
    | "step3_video_ml"
    | "step3_video_ta"
    | "pdf_url"
    | "join_link"
    | "content_overrides"
  >
>;

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const keys: (keyof PatchBody)[] = [
    "step1_video_en",
    "step1_video_ml",
    "step1_video_ta",
    "step3_video_en",
    "step3_video_ml",
    "step3_video_ta",
    "pdf_url",
    "join_link",
    "content_overrides",
  ];

  for (const k of keys) {
    if (body[k] !== undefined) payload[k] = body[k];
  }

  if (Object.keys(payload).length === 1) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .update(payload)
      .eq("id", 1)
      .select("*")
      .single();

    if (error) {
      console.error("[admin/settings PATCH]", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ settings: data as AppSettingsRow });
  } catch (e) {
    console.error("[admin/settings PATCH]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
