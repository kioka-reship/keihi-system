import { NextRequest, NextResponse } from "next/server";

// Vercel に RESEND_API_KEY を環境変数として追加してください
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL    = "kioka.reship@gmail.com";
const FROM_ADDRESS   = "keihi お問い合わせ <noreply@keihi.app>";

export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "メール送信が設定されていません" }, { status: 500 });
  }

  let name: string, email: string, subject: string, body: string;
  try {
    ({ name, email, subject, body } = await req.json());
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!name || !email || !subject || !body) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const adminHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1e40af;">📩 新しいお問い合わせ</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px;color:#6b7280;width:80px;">お名前</td><td style="padding:8px;">${name}</td></tr>
    <tr><td style="padding:8px;color:#6b7280;">メール</td><td style="padding:8px;">${email}</td></tr>
    <tr><td style="padding:8px;color:#6b7280;">件名</td><td style="padding:8px;">${subject}</td></tr>
  </table>
  <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;white-space:pre-wrap;">${body}</div>
</div>`;

  const replyHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#2563eb;padding:24px;border-radius:12px 12px 0 0;">
    <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">📒 keihi</p>
  </div>
  <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
    <p>${name} 様</p>
    <p>お問い合わせありがとうございます。以下の内容を受け付けました。</p>
    <div style="margin:16px 0;padding:16px;background:#f9fafb;border-radius:8px;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">件名</p>
      <p style="margin:0;font-weight:600;">${subject}</p>
    </div>
    <p style="color:#6b7280;font-size:13px;">通常3営業日以内にご返信いたします。</p>
    <p style="color:#6b7280;font-size:13px;">このメールは自動送信です。返信しないでください。</p>
  </div>
</div>`;

  try {
    const [adminRes, replyRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM_ADDRESS, to: [ADMIN_EMAIL], subject: `[お問い合わせ] ${subject}`, html: adminHtml, reply_to: email }),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM_ADDRESS, to: [email], subject: `【keihi】お問い合わせを受け付けました`, html: replyHtml }),
      }),
    ]);

    if (!adminRes.ok || !replyRes.ok) {
      console.error("Resend error:", await adminRes.text());
      return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("contact error:", error);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
