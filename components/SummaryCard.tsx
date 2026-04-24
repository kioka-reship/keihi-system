"use client";

import { Expense, ACCOUNT_ITEMS } from "@/types";

interface Props {
  expenses: Expense[];
}

export default function SummaryCard({ expenses }: Props) {
  const totals = new Map<string, number>();
  let grandTotal = 0;

  for (const e of expenses) {
    totals.set(e.accountItem, (totals.get(e.accountItem) ?? 0) + e.amount);
    grandTotal += e.amount;
  }

  const activeAccounts = ACCOUNT_ITEMS.filter((a) => totals.has(a));

  if (activeAccounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
        まだ経費が登録されていません
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <span className="font-semibold text-sm">科目別合計</span>
        <span className="font-bold text-lg">¥{grandTotal.toLocaleString()}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {activeAccounts.map((account) => {
          const total = totals.get(account)!;
          const ratio = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
          return (
            <div key={account} className="px-4 py-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{account}</span>
                <span className="font-medium text-gray-900">¥{total.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
