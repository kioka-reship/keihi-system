"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CreditSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.push("/credits");
      return;
    }

    fetch(`/api/stripe/session-info?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.credits) setCredits(data.credits);
      })
      .catch(console.error);
  }, [searchParams, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push("/register");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center gap-6 max-w-sm w-full">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">購入完了！</h1>
          {credits !== null ? (
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-blue-600">{credits}枚</span>の追加クレジットが付与されました。
            </p>
          ) : (
            <p className="text-sm text-gray-500">追加クレジットが付与されました。</p>
          )}
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
          ※ 追加枚数は当月限りです。繰り越しはありません。<br />
          反映には数秒かかる場合があります。
        </p>

        <p className="text-xs text-blue-500 font-medium">
          {countdown}秒後にレシート登録ページへ移動します
        </p>

        <div className="w-full space-y-2">
          <Link
            href="/register"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl py-3 transition-colors text-center"
          >
            レシートを登録する
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-2xl py-3 transition-colors text-center"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    </div>
  );
}
