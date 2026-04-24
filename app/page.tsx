"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Expense } from "@/types";
import { loadExpenses } from "@/lib/storage";
import SummaryCard from "@/components/SummaryCard";
import { downloadCSV } from "@/lib/csv";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setLoaded(true);
  }, []);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const thisMonthExpenses = expenses.filter((e) => {
    const [y, m] = e.date.split("-").map(Number);
    return y === currentYear && m === currentMonth;
  });

  const thisYearExpenses = expenses.filter((e) => {
    const [y] = e.date.split("-").map(Number);
    return y === currentYear;
  });

  const totalThisMonth = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalThisYear = thisYearExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-0.5">白色申告用 経費帳簿</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{currentMonth}月の経費合計</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loaded ? `¥${totalThisMonth.toLocaleString()}` : "…"}
          </p>
          <p className="text-xs text-gray-400 mt-1">{thisMonthExpenses.length}件</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{currentYear}年の経費合計</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loaded ? `¥${totalThisYear.toLocaleString()}` : "…"}
          </p>
          <p className="text-xs text-gray-400 mt-1">{thisYearExpenses.length}件</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/register"
          className="flex-1 bg-blue-600 text-white rounded-2xl py-3.5 text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
        >
          ＋ 経費を登録
        </Link>
        <button
          onClick={() => {
            const filename = `経費帳簿_${currentYear}.csv`;
            downloadCSV(thisYearExpenses, filename);
          }}
          className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-2xl py-3.5 text-sm font-semibold text-center hover:bg-gray-50 transition-colors"
          disabled={thisYearExpenses.length === 0}
        >
          ⬇ CSV出力
        </button>
      </div>

      {/* Summary */}
      {loaded && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">{currentYear}年 科目別合計</h2>
          <SummaryCard expenses={thisYearExpenses} />
        </div>
      )}

      {/* Recent */}
      {loaded && expenses.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-600">最近の経費</h2>
            <Link href="/list" className="text-xs text-blue-600 hover:underline">すべて見る</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {expenses.slice(0, 5).map((e) => (
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
