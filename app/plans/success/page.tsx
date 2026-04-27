"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlanSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push("/");
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

        {/* アイコン */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* メッセージ */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">決済が完了しました！</h1>
          <p className="text-sm text-gray-500">プランが有効になりました。</p>
        </div>

        {/* 注意書き */}
        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
          プランへの反映には数秒かかる場合があります。<br />
          表示が変わらない場合はページを再読み込みしてください。
        </p>

        {/* カウントダウン */}
        <p className="text-xs text-blue-500 font-medium">
          {countdown}秒後に自動でダッシュボードへ移動します
        </p>

        {/* ボタン */}
        <Link
          href="/"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl py-3 transition-colors"
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
}
