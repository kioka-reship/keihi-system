"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Expense } from "@/types";
import { loadExpenses } from "@/lib/storage";
import { downloadCSV } from "@/lib/csv";

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function HomePage() {
  const now = new Date();
  const todayYear  = now.getFullYear();
  const todayMonth = now.getMonth() + 1;

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded]           = useState(false);
  const [viewYear, setViewYear]       = useState(todayYear);
  const [viewMonth, setViewMonth]     = useState(todayMonth);

  const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

  useEffect(() => {
    loadExpenses().then(setAllExpenses).finally(() => setLoaded(true));
  }, []);

  function navigate(delta: number) {
    const next = shiftMonth(viewYear, viewMonth, delta);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  // 選択月の経費
  const monthExpenses = useMemo(() =>
    allExpenses.filter(e => {
      const [y, m] = e.date.split("-").map(Number);
      return y === viewYear && m === viewMonth;
    }),
    [allExpenses, viewYear, viewMonth]
  );

  const monthTotal = useMemo(() =>
    monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  // 科目別合計（金額降順、件数付き）
  const accountBreakdown = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    for (const e of monthExpenses) {
      const cur = map.get(e.accountItem) ?? { amount: 0, count: 0 };
      map.set(e.accountItem, { amount: cur.amount + e.amount, count: cur.count + 1 });
    }
    return [...map.entries()]
      .map(([account, data]) => ({ account, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses]);

  // 最近の経費（全期間・先頭5件）
  const recentExpenses = useMemo(() => allExpenses.slice(0, 5), [allExpenses]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-0.5">白色申告用 経費帳簿</p>
      </div>

      {/* 月ナビゲーション */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          aria-label="前の月"
        >
          ◀
        </button>
        <span className="font-semibold text-gray-800">
          {viewYear}年{viewMonth}月
        </span>
        <button
          onClick={() => navigate(1)}
          disabled={isCurrentMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="次の月"
        >
          ▶
        </button>
      </div>

      {/* 月合計カード */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 font-medium">{viewYear}年{viewMonth}月の経費合計</p>
        <p className="text-3xl font-bold text-gray-900 mt-1.5">
          {loaded ? `¥${monthTotal.toLocaleString()}` : "…"}
        </p>
        <p className="text-xs text-gray-400 mt-1">{loaded ? `${monthExpenses.length}件` : "…"}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Link
          href="/register"
          className="flex-1 bg-blue-600 text-white rounded-2xl py-3.5 text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
        >
          ＋ 経費を登録
        </Link>
        <button
          onClick={() => downloadCSV(monthExpenses, `経費帳簿_${viewYear}${String(viewMonth).padStart(2, "0")}.csv`)}
          disabled={monthExpenses.length === 0}
          className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-2xl py-3.5 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          ⬇ CSV出力
        </button>
      </div>

      {/* 科目別合計（選択月） */}
      {loaded && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-600">
              {viewMonth}月 科目別合計
            </h2>
            <Link href="/report" className="text-xs text-blue-600 hover:underline">
              年間レポートを見る →
            </Link>
          </div>

          {accountBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
              {viewMonth}月の経費はまだありません
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                <span className="font-semibold text-sm">科目別合計</span>
                <span className="font-bold">¥{monthTotal.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {accountBreakdown.map(({ account, amount, count }) => {
                  const ratio = monthTotal > 0 ? (amount / monthTotal) * 100 : 0;
                  return (
                    <div key={account} className="px-4 py-2.5">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{account}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">({count}件)</span>
                          <span className="font-medium text-gray-900 tabular-nums">
                            ¥{amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
          )}
        </div>
      )}

      {/* 最近の経費（全期間） */}
      {loaded && recentExpenses.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-600">最近の経費</h2>
            <Link href="/list" className="text-xs text-blue-600 hover:underline">すべて見る</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {recentExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{e.storeName}</p>
                  <p className="text-xs text-gray-400">{e.date} · {e.accountItem}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 ml-3 shrink-0">
                  ¥{e.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
