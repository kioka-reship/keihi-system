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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
      <div className="text-6xl">🎉</div>
      <h1 className="text-xl font-bold text-gray-800">お支払いが完了しました</h1>
      <p className="text-sm text-gray-500 max-w-xs">
        プランの切り替えには数秒かかる場合があります。
        反映されない場合はページを再読み込みしてください。
      </p>
      <div className="bg-blue-50 rounded-xl px-6 py-3 text-sm text-blue-700">
        {countdown}秒後にダッシュボードへ移動します…
      </div>
      <Link
        href="/"
        className="bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        今すぐダッシュボードへ
      </Link>
    </div>
  );
}
