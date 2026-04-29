"use client";

import { useState } from "react";
import Link from "next/link";

const CREDIT_PACKAGES = [
  {
    priceId: "price_1TRCPrARAfw3QBpCzJQYUJyp",
    credits: 20,
    price: 380,
    perSheet: 19,
    label: "追加20枚パック",
  },
  {
    priceId: "price_1TRCQIARAfw3QBpC2fYEKnpI",
    credits: 50,
    price: 880,
    perSheet: 17.6,
    label: "追加50枚パック",
    popular: true,
  },
  {
    priceId: "price_1TRCQcARAfw3QBpCXfINlw0P",
    credits: 100,
    price: 1580,
    perSheet: 15.8,
    label: "追加100枚パック",
  },
  {
    priceId: "price_1TRCQtARAfw3QBpCAHjrhIkF",
    credits: 300,
    price: 3480,
    perSheet: 11.6,
    label: "追加300枚パック",
    seasonal: true,
  },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/purchase-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "エラーが発生しました");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      alert("エラーが発生しました。しばらくしてからお試しください。");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">追加枚数を購入する</h1>
        <p className="text-sm text-gray-500 mt-0.5">今月の上限に達したときに追加で購入できます</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
        <span className="shrink-0 mt-0.5">⚠️</span>
        <span>
          追加枚数は<strong>当月限り</strong>です。翌月1日にリセットされ、繰り越しはありません。
          毎月大量に使う場合はプランのアップグレードをご検討ください。
        </span>
      </div>

      {/* パッケージ一覧 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.priceId}
            className={`relative rounded-2xl border-2 p-4 flex flex-col gap-3 ${
              pkg.popular
                ? "border-blue-500 bg-blue-50"
                : pkg.seasonal
                ? "border-orange-400 bg-orange-50"
                : "border-gray-200 bg-white"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                人気
              </span>
            )}
            {pkg.seasonal && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                確定申告向け
              </span>
            )}

            <div>
              <p className="text-xs text-gray-500 font-medium">{pkg.label}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {pkg.credits}
                <span className="text-sm font-normal text-gray-500 ml-1">枚</span>
              </p>
            </div>

            <div>
              <p className="text-xl font-bold text-gray-800">
                ¥{pkg.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                1枚 約¥{pkg.perSheet}
              </p>
            </div>

            <button
              onClick={() => handlePurchase(pkg.priceId)}
              disabled={loading === pkg.priceId}
              className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                pkg.popular
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : pkg.seasonal
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-900 hover:bg-gray-700 text-white"
              }`}
            >
              {loading === pkg.priceId ? "処理中…" : "購入する"}
            </button>
          </div>
        ))}
      </div>

      {/* プランとの比較 */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">💡 プランアップグレードとの比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          毎月追加購入するより、プランをアップグレードした方がお得になる場合があります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-gray-600">
            <thead>
              <tr className="text-gray-400 border-b border-gray-200">
                <th className="text-left py-2 font-medium">比較</th>
                <th className="text-right py-2 font-medium">増加枚数</th>
                <th className="text-right py-2 font-medium">月額差額</th>
                <th className="text-right py-2 font-medium">1枚あたり</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2">ライト → スタンダード</td>
                <td className="text-right py-2">+20枚/月</td>
                <td className="text-right py-2">+¥700/月</td>
                <td className="text-right py-2 font-semibold text-green-600">¥35</td>
              </tr>
              <tr>
                <td className="py-2">スタンダード → PRO</td>
                <td className="text-right py-2">+80枚/月</td>
                <td className="text-right py-2">+¥1,300/月</td>
                <td className="text-right py-2 font-semibold text-green-600">¥16.25</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <Link href="/plans" className="text-xs text-blue-600 hover:underline font-medium">
            プランを比較する →
          </Link>
        </div>
      </div>

      {/* 注意事項 */}
      <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
        <li>追加購入した枚数は当月限りです。翌月1日にリセットされます。</li>
        <li>繰り越しはありません。</li>
        <li>決済はStripeにより安全に処理されます。</li>
      </ul>
    </div>
  );
}
