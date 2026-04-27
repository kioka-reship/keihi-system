import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_ADDRESS = Deno.env.get("FROM_EMAIL") ?? "経費帳簿 <noreply@keihi.app>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://keihi-system-gamma.vercel.app";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: {
    id: string;
    email: string;
  };
}

Deno.serve(async (req) => {
  // Supabase WebhookのシークレットでリクエストをDB Webhookのみに制限
  const authHeader = req.headers.get("Authorization");
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // INSERTイベント以外は無視
  if (payload.type !== "INSERT" || payload.schema !== "auth" || payload.table !== "users") {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const { email } = payload.record;
  if (!email) {
    return new Response(JSON.stringify({ skipped: true, reason: "no email" }), { status: 200 });
  }

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

    <div style="background:#2563eb;padding:32px 40px;">
      <p style="margin:0;font-size:24px;font-weight:700;color:#fff;">📒 経費帳簿</p>
      <p style="margin:8px 0 0;font-size:14px;color:#bfdbfe;">白色申告用 AI経費管理</p>
    </div>

    <div style="padding:32px 40px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">経費帳簿へようこそ！</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">ご登録ありがとうございます。さっそく使い方をご確認ください。</p>

      <div style="background:#f8faff;border:1px solid #dbeafe;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1e40af;">📸 レシートをAIで自動解析</p>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">レシートや領収書を撮影してアップロードするだけで、日付・金額・勘定科目を自動で読み取ります。</p>
      </div>

      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">はじめ方</p>
      <ol style="margin:0 0 24px;padding-left:20px;font-size:13px;color:#374151;line-height:2;">
        <li>ダッシュボードから「登録」をタップ</li>
        <li>レシートの写真をアップロード</li>
        <li>AIが解析した内容を確認して保存</li>
        <li>一覧からCSVエクスポートで確定申告に活用</li>
      </ol>

      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px;font-size:12px;color:#6b7280;">
        <p style="margin:0 0 4px;font-weight:600;color:#374151;">無料プランについて</p>
        <p style="margin:0;line-height:1.6;">お試しプランでは月3枚まで解析できます。より多く使いたい場合はプランページからアップグレードをご検討ください。</p>
      </div>

      <a href="${APP_URL}" style="display:block;text-align:center;background:#2563eb;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:12px;">
        ダッシュボードを開く
      </a>
    </div>

    <div style="padding:16px 40px 24px;text-align:center;font-size:11px;color:#9ca3af;">
      このメールは ${email} 宛に送信されました。<br>
      心当たりがない場合はこのメールを無視してください。
    </div>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [email],
      subject: "経費帳簿へようこそ！",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ ok: false, error: err }), { status: 500 });
  }

  const data = await res.json();
  console.log("Welcome email sent:", email, data.id);
  return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200 });
});
