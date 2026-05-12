import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? admin : null;
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });

  const { code, name, description } = await req.json();
  if (!code?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "code と name は必須です" }, { status: 400 });
  }

  const { error } = await admin
    .from("referral_codes")
    .insert({ code: code.trim(), name: name.trim(), description: description ?? null });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
