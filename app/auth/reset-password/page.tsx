"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    });

    if (error) {
      setError("送信に失敗しました。もう一度お試しください");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">📒</p>
          <h1 className="text-xl font-bold text-gray-800">経費帳簿</h1>
          <p className="text-sm text-gray-500 mt-1">白色申告用 経費管理</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">パスワードリセット</h2>
          <p className="text-xs text-gray-500 mb-5">
            登録済みのメールアドレスにリセット用のリンクを送信します
          </p>

          {sent ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm border border-green-200">
                メールを送信しました。受信トレイをご確認ください。
              </div>
              <p className="text-center text-xs text-gray-500">
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  ログインに戻る
                </Link>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "送信中…" : "リセットメールを送信"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-4">
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  ログインに戻る
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
