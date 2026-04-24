"use client";

import { AccountItem, ACCOUNT_ITEMS, ReceiptAnalysis } from "@/types";

interface Props {
  analysis: ReceiptAnalysis;
  values: {
    date: string;
    storeName: string;
    amount: string;
    description: string;
    accountItem: AccountItem;
    memo: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function AnalysisResult({ analysis, values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
        <span className="text-lg">✅</span>
        <span className="text-sm font-medium">AI解析完了。内容を確認・修正してください。</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">日付</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={values.date}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">店名</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={values.storeName}
            onChange={(e) => onChange("storeName", e.target.value)}
            placeholder="店名・会社名"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">金額（円）</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={values.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            勘定科目
            <span className="ml-1 text-blue-500 text-xs">
              （AI候補: {analysis.suggestedAccounts.join(" / ")}）
            </span>
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            value={values.accountItem}
            onChange={(e) => onChange("accountItem", e.target.value)}
          >
            {/* AI suggestions first */}
            {analysis.suggestedAccounts.length > 0 && (
              <optgroup label="AIの提案">
                {analysis.suggestedAccounts.map((a) => (
                  <option key={`suggested-${a}`} value={a}>
                    ★ {a}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="全科目">
              {ACCOUNT_ITEMS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">品目・内容</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="購入品目や内容"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">メモ（任意）</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={values.memo}
          onChange={(e) => onChange("memo", e.target.value)}
          placeholder="補足メモ"
        />
      </div>
    </div>
  );
}
