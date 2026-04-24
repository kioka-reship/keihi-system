import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ACCOUNT_ITEMS, ReceiptAnalysis } from "@/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "画像が必要です" }, { status: 400 });
    }

    const accountList = ACCOUNT_ITEMS.join("、");

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `このレシートを解析して、以下のJSON形式で情報を抽出してください。

必ず以下のフォーマットのJSONのみを返してください（説明文は不要）：
{
  "date": "YYYY-MM-DD形式の日付（不明な場合は今日の日付）",
  "storeName": "店名または会社名",
  "amount": 合計金額の数値（税込み、数字のみ）,
  "description": "主な品目や内容の説明",
  "suggestedAccounts": ["最も適切な勘定科目", "2番目に適切な科目", "3番目に適切な科目"]
}

suggestedAccountsは必ず以下のリストから選んでください：
${accountList}

レシートの内容に基づいて最も適切な科目から順に3つ選んでください。`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("予期しないレスポンス形式");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSONの抽出に失敗しました");
    }

    const parsed = JSON.parse(jsonMatch[0]) as ReceiptAnalysis;

    // Validate suggested accounts
    parsed.suggestedAccounts = (parsed.suggestedAccounts || [])
      .filter((a) => ACCOUNT_ITEMS.includes(a as (typeof ACCOUNT_ITEMS)[number]))
      .slice(0, 3) as typeof ACCOUNT_ITEMS[number][];

    if (parsed.suggestedAccounts.length === 0) {
      parsed.suggestedAccounts = ["雑費"];
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "解析に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
