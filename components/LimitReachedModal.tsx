"use client";

import { useRouter } from "next/navigation";

interface Props {
  plan: string;
  limit: number;
  remaining: number;
  onClose: () => void;
}

export default function LimitReachedModal({ plan, limit, remaining, onClose }: Props) {
  const router = useRouter();
  const isTrial = plan === "none" || plan === "free";

  function handleUpgrade() {
    router.push("/plans");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* アイコン */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        {/* テキスト */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-gray-900">
            今月の解析上限に達しました
          </h2>
          <p className="text-sm text-gray-500">
            {isTrial
              ? `お試しプランは月${limit}枚まで解析できます。`
              : `現在のプランの月間上限（${limit}枚）に達しました。`}
            {remaining > 0 && `残り${remaining}枚です。`}
          </p>
        </div>

        {/* プラン情報 */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1">
          <p className="font-semibold">プランをアップグレードすると</p>
          <ul className="text-xs space-y-0.5 text-blue-700 list-none">
            <li>• ライト：月20枚 ¥980/月</li>
            <li>• スタンダード：月40枚 ¥1,680/月</li>
            <li>• PRO：月120枚 ¥2,980/月</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="space-y-2">
          <button
            onClick={handleUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 transition-colors"
          >
            プランをアップグレード
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
