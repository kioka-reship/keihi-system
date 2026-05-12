import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const admin = createAdminClient();
  // upsert でプロフィール行が存在しない場合も確実に作成・更新
  const { error } = await admin
    .from("profiles")
    .upsert(
      {
        id:            user.id,
        email:         user.email ?? "",
        plan:          "free",
        extra_credits: 0,
        monthly_count: 0,
        is_admin:      false,
      },
      { onConflict: "id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
