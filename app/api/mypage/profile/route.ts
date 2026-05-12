import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { name, phone } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: "電話番号は必須です" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ name: name.trim(), phone: phone.trim() })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
