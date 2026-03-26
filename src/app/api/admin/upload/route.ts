import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/require-admin";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const path = "earning-plan.pdf";

  try {
    const supabase = createAdminClient();
    const { error: upErr } = await supabase.storage.from("content").upload(path, buf, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (upErr) {
      console.error("[admin/upload]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from("content").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { data: settings, error: sErr } = await supabase
      .from("app_settings")
      .update({ pdf_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select("*")
      .single();

    if (sErr) {
      return NextResponse.json({ error: "Saved file but could not update settings" }, { status: 500 });
    }

    return NextResponse.json({ pdf_url: publicUrl, settings });
  } catch (e) {
    console.error("[admin/upload]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
