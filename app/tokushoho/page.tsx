export const metadata = {
  title: "特定商取引法に基づく表記 | keihi",
};

// ─────────────────────────────────────────────────────────────
// ▼ 公開時に専用メールアドレスへ差し替えてください（ここだけ変更すればOK）
const CONTACT_EMAIL = "準備中（近日公開予定）";
// ─────────────────────────────────────────────────────────────

const ITEMS = [
  { label: "販売業者",       value: "合同会社Relationship" },
  { label: "運営責任者",     value: "木岡 克太" },
  { label: "所在地",         value: "福岡市博多区博多駅前1－15－20ー2F" },
  { label: "電話番号",       value: "050-3554-4028（お問い合わせはメールにて受付しております）" },
  { label: "メールアドレス", value: CONTACT_EMAIL },
  { label: "サービス名",     value: "keihi（経費帳簿）" },
  {
    label: "販売価格",
    value: "お試し：無料（月3枚まで）／ライト：月額¥980（税込）／スタンダード：月額¥1,680（税込）／PRO：月額¥2,980（税込）\n追加枚数パック：¥380〜¥3,480（税込・当月限り）",
  },
  { label: "支払方法",         value: "クレジットカード（Visa・Mastercard・American Express・JCB 他）" },
  { label: "支払時期",         value: "サブスクリプションプラン：お申込み時に課金開始、以降毎月同日に自動課金\n追加枚数パック：お申込み時に一括課金" },
  { label: "サービス提供開始", value: "決済完了後、即時ご利用いただけます。" },
  {
    label: "解約・キャンセル",
    value: "サブスクリプションはマイページよりいつでも解約可能です。解約後は当月末まで引き続きご利用いただけます。月途中の解約による日割り返金は行っておりません。\n追加枚数パックは購入完了後のキャンセル・返金は原則行いません。",
  },
  { label: "動作環境", value: "インターネット接続環境・最新版の主要ブラウザ（Chrome・Safari・Firefox・Edge）" },
  { label: "免責事項", value: "AIによるレシート解析結果の正確性は保証しません。申告内容については税理士等の専門家にご相談ください。" },
];

export default function TokushohoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">特定商取引法に基づく表記</h1>
        <p className="text-sm text-gray-500 mt-1">最終更新：2026年4月30日</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        ※ メールアドレスは準備中です。専用アドレス取得後、<code className="font-mono bg-amber-100 px-1 rounded">app/tokushoho/page.tsx</code> 冒頭の <code className="font-mono bg-amber-100 px-1 rounded">CONTACT_EMAIL</code> を差し替えてください。
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {ITEMS.map(({ label, value }) => (
              <tr key={label}>
                <th className="text-left px-5 py-4 font-medium text-gray-600 bg-gray-50 w-36 align-top whitespace-nowrap">
                  {label}
                </th>
                <td className="px-5 py-4 text-gray-800 leading-relaxed whitespace-pre-line">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
