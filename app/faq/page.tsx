"use client";

import { useState } from "react";

export const dynamic = "force-static";

const FAQS = [
  {
    q: "無料プランでできることは？",
    a: "毎月3枚まで無料でレシート解析できます。解析した経費の記録・管理・CSV出力はすべての機能をご利用いただけます。4枚目以降はプランのアップグレードまたは追加枚数の購入が必要です。",
  },
  {
    q: "解析精度はどのくらいですか？",
    a: "Google Gemini AIによる解析のため、レシートの状態・解像度・言語によって精度が異なります。100%の精度は保証できません。解析結果は必ず内容をご確認のうえ保存してください。",
  },
  {
    q: "追加購入した枚数は翌月に繰り越されますか？",
    a: "繰り越しはできません。追加購入した枚数は当月限りとなります。翌月1日に月間枚数とともにリセットされます。毎月大量に使用する場合はプランのアップグレードをご検討ください。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "はい、マイページからいつでも解約できます。解約後も当月末まで引き続きご利用いただけます。月途中の解約による日割り返金は行っておりません。",
  },
  {
    q: "領収書の原本は保管が必要ですか？",
    a: "はい。本サービスはデータ管理の補助ツールです。税務上の原本としての効力はありません。領収書・レシートの原本は法定保管期間（白色申告の場合5年、青色申告の場合7年）に従い保管してください。",
  },
  {
    q: "白色申告以外にも使えますか？",
    a: "青色申告の経費記録にもご利用いただけます。ただし、青色申告専用の機能（仕訳帳・総勘定元帳等）は現在搭載していません。経費データのCSV出力は会計ソフトへのインポートにご活用いただけます。",
  },
  {
    q: "データはどこに保存されていますか？",
    a: "Supabase（AWSインフラ、東京リージョン）に暗号化して保存されています。行レベルセキュリティ（RLS）により、ご自身のデータにのみアクセスできます。",
  },
  {
    q: "対応している画像形式は？",
    a: "JPEG・PNG・WebP・HEICに対応しています。スマートフォンで撮影した写真はそのままアップロードできます。画像は自動的に最適なサイズに変換されます。",
  },
  {
    q: "複数のレシートを一度に解析できますか？",
    a: "はい、1回の操作で最大5枚まで同時に解析できます。解析結果を確認・修正してから一括保存することができます。",
  },
  {
    q: "プランはいつでも変更できますか？",
    a: "はい、プランページからいつでもアップグレード・ダウングレードができます。変更は即時に反映されます。",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">よくある質問</h1>
        <p className="text-sm text-gray-500 mt-0.5">ご不明な点はお問い合わせフォームからもご相談ください</p>
      </div>

      <div className="space-y-2">
        {FAQS.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="text-sm font-medium text-gray-800 pr-4">{item.q}</span>
              <span className={`shrink-0 text-gray-400 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
        <p className="text-sm font-medium text-blue-800">解決しない場合はお問い合わせください</p>
        <a
          href="/contact"
          className="inline-block mt-3 text-sm text-blue-600 hover:underline font-medium"
        >
          お問い合わせフォームへ →
        </a>
      </div>
    </div>
  );
}
