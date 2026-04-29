"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName]               = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim())  { setError("氏名を入力してください"); return; }
    if (!phone.trim()) { setError("電話番号を入力してください"); return; }
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 8)  { setError("パスワードは8文字以上で入力してください"); return; }

    setLoading(true);

    // 1. Supabase Auth でアカウント作成
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "このメールアドレスは既に登録されています"
          : "登録に失敗しました。もう一度お試しください"
      );
      setLoading(false);
      return;
    }

    // 2. プロフィール情報（氏名・電話・紹介コード）を保存
    const res = await fetch("/api/auth/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, referralCode }),
    });
    if (!res.ok) {
      // プロフィール保存失敗は致命的ではないのでログのみ（ユーザーはマイページで後から更新可）
      console.error("profile save failed:", await res.text());
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">📒</p>
          <h1 className="text-xl font-bold text-gray-800">経費帳簿</h1>
          <p className="text-sm text-gray-500 mt-1">白色申告用 経費管理</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">新規登録</h2>
          <p className="text-xs text-gray-500 mb-5">無料でお試し3枚まで解析できます</p>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="氏名" required>
              <input
                type="text"
                required
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
              />
            </Field>

            <Field label="電話番号" required>
              <input
                type="tel"
                required
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090-0000-0000"
              />
            </Field>

            <Field label="メールアドレス" required>
              <input
                type="email"
                required
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </Field>

            <Field label="パスワード（8文字以上）" required>
              <input
                type="password"
                required
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <Field label="パスワード（確認）" required>
              <input
                type="password"
                required
                className={inputCls}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <Field label="紹介コード（任意）">
              <input
                type="text"
                className={inputCls}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="紹介コードをお持ちの方は入力"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "登録中…" : "アカウントを作成"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            既にアカウントをお持ちの方は{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">ログイン</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-3">
            登録により
            <Link href="/terms"   className="underline mx-0.5">利用規約</Link>
            および
            <Link href="/privacy" className="underline mx-0.5">プライバシーポリシー</Link>
            に同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
