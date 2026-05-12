"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [sessionReady, setSessionReady] = useState(false);
  const [exchangeError, setExchangeError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // マウント時に ?code= またはハッシュフラグメントからセッションを確立する
  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      // PKCEフロー: ?code= パラメータ
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setExchangeError("リンクの有効期限が切れています。パスワードリセットをやり直してください。");
        } else {
          setSessionReady(true);
        }
      });
      return;
    }

    // Implicitフロー: #access_token=xxx&refresh_token=yyy&type=recovery
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken  = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token") ?? "";
    const type         = hashParams.get("type");

    if (accessToken && type === "recovery") {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (error) {
          setExchangeError("リンクの有効期限が切れています。パスワードリセットをやり直してください。");
        } else {
          setSessionReady(true);
        }
      });
      return;
    }

    setExchangeError("リセットリンクが無効です。パスワードリセットをやり直してください。");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("パスワードの更新に失敗しました。もう一度お試しください");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
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
          <h2 className="text-lg font-semibold text-gray-800 mb-1">新しいパスワードを設定</h2>
          <p className="text-xs text-gray-500 mb-5">8文字以上で入力してください</p>

          {/* セッション交換エラー */}
          {exchangeError && (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">
                {exchangeError}
              </div>
              <a
                href="/auth/reset-password"
                className="block text-center text-sm text-blue-600 hover:underline"
              >
                パスワードリセットをやり直す
              </a>
            </div>
          )}

          {/* セッション交換中ローディング */}
          {!exchangeError && !sessionReady && (
            <div className="py-6 text-center text-sm text-gray-400">
              確認中…
            </div>
          )}

          {/* パスワード更新フォーム */}
          {sessionReady && (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 border border-red-200">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    新しいパスワード（8文字以上）
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "更新中…" : "パスワードを更新"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// useSearchParams は Suspense でラップが必要
export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  );
}
