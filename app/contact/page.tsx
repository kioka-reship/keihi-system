"use client";

import { useState } from "react";

type FormState = { name: string; email: string; subject: string; body: string };
type Status = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", body: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<Status>("idle");

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim())    e.name    = "お名前を入力してください";
    if (!form.email.trim())   e.email   = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "正しいメールアドレスを入力してください";
    if (!form.subject.trim()) e.subject = "件名を入力してください";
    if (!form.body.trim())    e.body    = "本文を入力してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", subject: "", body: "" });
    } catch {
      setStatus("error");
    }
  }

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  });

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800">送信が完了しました</h2>
        <p className="text-sm text-gray-500">お問い合わせありがとうございます。<br />確認メールをお送りしました。3営業日以内に返信いたします。</p>
        <button onClick={() => setStatus("idle")} className="text-sm text-blue-600 hover:underline">
          別のお問い合わせをする
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-gray-800">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mt-0.5">ご質問・ご要望をお気軽にお送りください</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <Field label="お名前" error={errors.name} required>
          <input
            type="text"
            placeholder="山田 太郎"
            className={inputClass(!!errors.name)}
            {...field("name")}
          />
        </Field>

        <Field label="メールアドレス" error={errors.email} required>
          <input
            type="email"
            placeholder="example@email.com"
            className={inputClass(!!errors.email)}
            {...field("email")}
          />
        </Field>

        <Field label="件名" error={errors.subject} required>
          <input
            type="text"
            placeholder="お問い合わせ件名"
            className={inputClass(!!errors.subject)}
            {...field("subject")}
          />
        </Field>

        <Field label="本文" error={errors.body} required>
          <textarea
            rows={6}
            placeholder="お問い合わせ内容をご記入ください"
            className={inputClass(!!errors.body)}
            {...field("body")}
          />
        </Field>

        {status === "error" && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            送信に失敗しました。しばらくしてからもう一度お試しください。
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 transition-colors disabled:opacity-50"
        >
          {status === "sending" ? "送信中…" : "送信する"}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center">
        通常3営業日以内に返信いたします。
      </p>
    </div>
  );
}

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    hasError ? "border-red-300 bg-red-50" : "border-gray-300"
  }`;
