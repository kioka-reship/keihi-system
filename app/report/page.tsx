"use client";

import { useEffect, useState, useMemo } from "react";
import { Expense } from "@/types";
import { loadExpenses } from "@/lib/storage";
import { downloadCSV } from "@/lib/csv";

export default function ReportPage() {
  const todayYear = new Date().getFullYear();

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded]           = useState(false);
  const [viewYear, setViewYear]       = useState(todayYear);

  useEffect(() => {
    loadExpenses().then(setAllExpenses).finally(() => setLoaded(true));
  }, []);

  // 選択年の経費
  const yearExpenses = useMemo(() =>
    allExpenses.filter(e => Number(e.date.slice(0, 4)) === viewYear),
    [allExpenses, viewYear]
  );

  const yearTotal = useMemo(() =>
    yearExpenses.reduce((s, e) => s + e.amount, 0),
    [yearExpenses]
  );

  // 科目別合計（金額降順）
  const accountBreakdown = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    for (const e of yearExpenses) {
      const cur = map.get(e.accountItem) ?? { amount: 0, count: 0 };
      map.set(e.accountItem, { amount: cur.amount + e.amount, count: cur.count + 1 });
    }
    return [...map.entries()]
      .map(([account, data]) => ({ account, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [yearExpenses]);

  const maxAccountAmount = accountBreakdown[0]?.amount ?? 1;

  // 月別推移（1〜12月）
  const monthlyBreakdown = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const mm = yearExpenses.filter(e => Number(e.date.slice(5, 7)) === month);
      return { month, amount: mm.reduce((s, e) => s + e.amount, 0), count: mm.length };
    }),
    [yearExpenses]
  );

  const maxMonthAmount = Math.max(...monthlyBreakdown.map(m => m.amount), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">年間レポート</h1>
        <p className="text-sm text-gray-500 mt-0.5">科目別・月別の経費集計</p>
      </div>

      {/* 年ナビゲーション */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-4 py-3">
        <button
          onClick={() => setViewYear(y => y - 1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          aria-label="前の年"
        >
          ◀
        </button>
        <span className="font-semibold text-gray-800">{viewYear}年</span>
        <button
          onClick={() => setViewYear(y => y + 1)}
          disabled={viewYear >= todayYear}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="次の年"
        >
          ▶
        </button>
      </div>

      {/* 年間合計 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs text-gray-400 font-medium">{viewYear}年の経費合計</p>
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {loaded ? `¥${yearTotal.toLocaleString()}` : "…"}
          </p>
          <p className="text-xs text-gray-400 mt-1">{loaded ? `${yearExpenses.length}件` : "…"}</p>
        </div>
        {loaded && yearExpenses.length > 0 && (
          <button
            onClick={() => downloadCSV(yearExpenses, `経費帳簿_${viewYear}年.csv`)}
            className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            ⬇ CSV出力（{viewYear}年全件）
          </button>
        )}
      </div>

      {/* 科目別年間合計 */}
      {loaded && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">科目別合計</h2>
          {accountBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
              {viewYear}年の経費はありません
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {accountBreakdown.map(({ account, amount, count }) => {
                const pct = yearTotal > 0 ? Math.round((amount / yearTotal) * 100) : 0;
                const barW = Math.round((amount / maxAccountAmount) * 100);
                return (
                  <div key={account} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700 min-w-0 mr-2 truncate">{account}</span>
                      <div className="flex items-center gap-2 shrink-0 text-sm">
                        <span className="text-xs text-gray-400 tabular-nums">{pct}%</span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                          ¥{amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">({count}件)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${barW}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 月別推移 */}
      {loaded && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">月別推移</h2>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {monthlyBreakdown.map(({ month, amount, count }) => {
              const barW = maxMonthAmount > 0 ? Math.round((amount / maxMonthAmount) * 100) : 0;
              const isEmpty = amount === 0;
              return (
                <div key={month} className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-7 shrink-0 tabular-nums">
                      {month}月
                    </span>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        {!isEmpty && (
                          <div
                            className="h-full bg-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${barW}%` }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right w-36">
                      <span className={`text-sm font-medium tabular-nums ${isEmpty ? "text-gray-300" : "text-gray-900"}`}>
                        ¥{amount.toLocaleString()}
                      </span>
                      {count > 0 && (
                        <span className="text-xs text-gray-400 ml-1.5">({count}件)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
