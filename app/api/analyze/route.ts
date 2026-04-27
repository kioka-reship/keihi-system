import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACCOUNT_ITEMS, ReceiptAnalysis } from "@/types";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  // adminクライアントでprofileを取得（RLSバイパス・monthly_count含む）
  const admin = createAdminClient();
  const profile = await getOrCreateProfile(supabase, user.id, user.email ?? "");
  const { data: profileData } = await admin
    .from("profiles")
    .select("monthly_count")
    .eq("id", user.id)
    .single();

  const planKey = (profile.plan || "none") as PlanKey;
  const monthlyLimit = PLAN_CONFIG[planKey]?.monthlyLimit ?? PLAN_CONFIG.none.monthlyLimit;
  const used = profileData?.monthly_count ?? 0;

  // Gemini APIキーチェック
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "Gemini APIキーが設定されていません" }, { status: 500 });

  try {
    const { imageBase64, mediaType, count: rawCount } = await req.json();
    // count=0 はバッチの後続呼び出し（初回でquota確保済み）→ 上限チェック・カウント更新をスキップ
    const count = Math.max(0, Math.floor(Number(rawCount) || 1));

    // monthly_count ベースで上限チェック（count>0 のときのみ）
    const remaining = monthlyLimit - used;
    if (count > 0 && remaining < count) {
      return NextResponse.json({
        error: planKey === "none"
          ? `お試し上限（${monthlyLimit}枚）に達しました。プランを選択してご利用ください。`
          : remaining <= 0
            ? `今月の解析上限（${monthlyLimit}枚）に達しました。プランをアップグレードしてください。`
            : `残り${remaining}枚しかありません（${count}枚分は処理できません）。`,
        limitReached: true,
        remaining,
        plan: planKey,
        limit: monthlyLimit,
      }, { status: 403 });
    }

    if (!imageBase64) return NextResponse.json({ error: "画像が必要です" }, { status: 400 });

    const cleanBase64 = (imageBase64 as string).replace(/\s/g, "");
    const safeMimeType = (mediaType === "image/png" || mediaType === "image/webp") ? mediaType : "image/jpeg";

    // Gemini呼び出し
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const accountList = ACCOUNT_ITEMS.join("、");
    const prompt = `このレシートを解析して、以下のJSON形式のみで返してください（説明文不要）：
{
  "date": "YYYY-MM-DD形式（不明なら今日の日付）",
  "storeName": "店名または会社名",
  "amount": 合計金額の数値（税込、数字のみ）,
  "description": "主な品目や内容",
  "suggestedAccounts": ["最適な科目", "2番目", "3番目"]
}
suggestedAccountsは必ず以下から選択：${accountList}`;

    const result = await model.generateContent([
      { inlineData: { mimeType: safeMimeType, data: cleanBase64 } },
      prompt,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSONの抽出に失敗しました");

    const parsed = JSON.parse(jsonMatch[0]) as ReceiptAnalysis;

    parsed.suggestedAccounts = (parsed.suggestedAccounts || [])
      .filter((a) => ACCOUNT_ITEMS.includes(a as typeof ACCOUNT_ITEMS[number]))
      .slice(0, 3) as typeof ACCOUNT_ITEMS[number][];

    if (parsed.suggestedAccounts.length === 0) {
      parsed.suggestedAccounts = ["雑費"];
    }

    // count=0 の後続呼び出しはカウント更新をスキップ
    if (count > 0) {
      const yearMonth = new Date().toISOString().slice(0, 7);
      const logs = Array.from({ length: count }, () => ({ user_id: user.id, year_month: yearMonth }));
      await supabase.from("usage_logs").insert(logs);
      await admin
        .from("profiles")
        .update({ monthly_count: used + count })
        .eq("id", user.id);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", message);
    return NextResponse.json({ error: `解析に失敗しました: ${message}` }, { status: 500 });
  }
}
