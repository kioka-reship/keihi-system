import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 管理者チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!myProfile?.is_admin) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  const { id } = await params;

  // 自分自身の is_admin 変更は禁止
  if (id === user.id) {
    return NextResponse.json({ error: "自分自身の管理者権限は変更できません" }, { status: 400 });
  }

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.plan !== undefined)        update.plan          = body.plan;
  if (body.extraCredits !== undefined) update.extra_credits = body.extraCredits;
  if (body.isAdmin !== undefined)     update.is_admin      = body.isAdmin;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
