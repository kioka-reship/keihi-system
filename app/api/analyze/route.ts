import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_ITEMS, ReceiptAnalysis } from "@/types";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  // プロフィール取得（存在しない場合は自動作成）
  const profile = await getOrCreateProfile(supabase, user.id, user.email ?? "");

  // 今月の使用枚数チェック
  const yearMonth = new Date().toISOString().slice(0, 7);
  const { count: usedThisMonth } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("year_month", yearMonth);

  const planKey = (profile.plan || "none") as PlanKey;
  const monthlyLimit = PLAN_CONFIG[planKey]?.monthlyLimit ?? PLAN_CONFIG.none.monthlyLimit;
  const extraCredits = profile.extra_credits ?? 0;
  const used = usedThisMonth ?? 0;

  if (used >= monthlyLimit && extraCredits <= 0) {
    const isTrialUser = planKey === "none";
    return NextResponse.json({
      error: isTrialUser
        ? `お試し上限（${monthlyLimit}枚）に達しました。プランを選択してご利用ください。`
        : `今月の解析上限（${monthlyLimit}枚）に達しました。追加クレジットをご購入ください。`,
      limitReached: true,
    }, { status: 403 });
  }

  // Gemini APIキーチェック
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "Gemini APIキーが設定されていません" }, { status: 500 });

  try {
    const { imageBase64, mediaType } = await req.json();
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

    // 使用ログ記録
    await supabase.from("usage_logs").insert({ user_id: user.id, year_month: yearMonth });

    // 月間上限超過時はextra_creditsを消費
    if (used >= monthlyLimit && extraCredits > 0) {
      await supabase
        .from("profiles")
        .update({ extra_credits: extraCredits - 1 })
        .eq("id", user.id);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", message);
    return NextResponse.json({ error: `解析に失敗しました: ${message}` }, { status: 500 });
  }
}
