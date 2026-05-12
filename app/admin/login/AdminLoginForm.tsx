"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. ログイン
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
      return;
    }

    // 2. is_admin チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("認証に失敗しました");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      // 管理者でない場合はログアウトしてエラー表示
      await supabase.auth.signOut();
      setError("管理者権限がありません");
      setLoading(false);
      return;
    }

    // 3. admin_verified クッキーをセット（24時間）
    document.cookie = "admin_verified=1; path=/; max-age=86400; SameSite=Strict";

    // 4. /admin へ
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">🔐</p>
          <h1 className="text-xl font-bold text-white">管理者ログイン</h1>
          <p className="text-sm text-gray-400 mt-1">keihi 管理画面</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          {error && (
            <div className="bg-red-900/50 text-red-300 rounded-lg px-4 py-3 text-sm mb-5 border border-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                パスワード
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "ログイン中…" : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
