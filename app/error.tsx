"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">エラーが発生しました</h1>
        <p className="text-sm text-gray-500">
          予期せぬエラーが発生しました。もう一度お試しください。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl px-6 py-3 transition-colors"
          >
            再試行する
          </button>
          <Link
            href="/"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl px-6 py-3 transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
