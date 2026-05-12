import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { name, phone, address, referralCode } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: "電話番号は必須です" }, { status: 400 });

  const admin = createAdminClient();

  // 紹介コード照合：一致した場合のみ referred_by にコードの name を保存
  let referredBy: string | null = null;
  const code = referralCode?.trim() || null;
  if (code) {
    const { data: refRecord } = await admin
      .from("referral_codes")
      .select("name")
      .eq("code", code)
      .single();
    if (refRecord) referredBy = refRecord.name;
    // 一致しない場合はエラーにせず続行（referredBy は null のまま）
  }

  const { error } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        name: name.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        referral_code: code,
        referred_by: referredBy,
        plan: "none",
        extra_credits: 0,
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("complete-profile error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
