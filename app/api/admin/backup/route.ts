import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  // admin_verified クッキー確認
  const adminVerified = req.cookies.get("admin_verified")?.value;
  if (!adminVerified) {
    return NextResponse.json({ error: "管理者認証が必要です" }, { status: 403 });
  }

  // is_admin 確認
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const adminClient = createAdminClient();
  const { data: myProfile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!myProfile?.is_admin) {
    return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  }

  // profiles・expenses テーブル全件取得
  const [{ data: profiles, error: profilesError }, { data: expenses, error: expensesError }] =
    await Promise.all([
      adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
      adminClient.from("expenses").select("*").order("created_at", { ascending: false }),
    ]);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }
  if (expensesError) {
    return NextResponse.json({ error: expensesError.message }, { status: 500 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const payload = {
    exported_at: new Date().toISOString(),
    tables: {
      profiles: { count: profiles?.length ?? 0, data: profiles ?? [] },
      expenses: { count: expenses?.length ?? 0, data: expenses ?? [] },
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="keihi-backup-${date}.json"`,
    },
  });
}
