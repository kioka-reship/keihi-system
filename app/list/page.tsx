"use client";

import { useEffect, useState } from "react";
import { Expense, ACCOUNT_ITEMS, AccountItem } from "@/types";
import { loadExpenses, updateExpense, deleteExpense } from "@/lib/storage";
import { downloadCSV } from "@/lib/csv";
import EditModal from "@/components/EditModal";
import Image from "next/image";

type SortKey = "date" | "amount" | "storeName";
type SortDir = "asc" | "desc";

export default function ListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

  function refresh() {
    setExpenses(loadExpenses());
  }

  function handleDelete(id: string) {
    if (confirm("この経費を削除しますか？")) {
      deleteExpense(id);
      refresh();
    }
  }

  function handleSave(updated: Expense) {
    updateExpense(updated);
    setEditTarget(null);
    refresh();
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const years = [...new Set(expenses.map((e) => e.date.split("-")[0]))].sort().reverse();

  let filtered = expenses;
  if (filterAccount) filtered = filtered.filter((e) => e.accountItem === filterAccount);
  if (filterYear) filtered = filtered.filter((e) => e.date.startsWith(filterYear));
  if (filterMonth) filtered = filtered.filter((e) => e.date.split("-")[1] === filterMonth.padStart(2, "0"));

  const sorted = [...filtered].sort((a, b) => {
    let v = 0;
    if (sortKey === "date") v = a.date.localeCompare(b.date);
    else if (sortKey === "amount") v = a.amount - b.amount;
    else if (sortKey === "storeName") v = a.storeName.localeCompare(b.storeName, "ja");
    return sortDir === "asc" ? v : -v;
  });

  const total = sorted.reduce((s, e) => s + e.amount, 0);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">経費一覧</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sorted.length}件 / ¥{total.toLocaleString()}</p>
        </div>
        <button
          onClick={() => downloadCSV(sorted, `経費_${filterYear || "全期間"}.csv`)}
          disabled={sorted.length === 0}
          className="bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
        >
          ⬇ CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <select
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">年：全て</option>
          {years.map((y) => <option key={y} value={y}>{y}年</option>)}
        </select>

        <select
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">月：全て</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={String(m)}>{m}月</option>
          ))}
        </select>

        <select
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 col-span-2 sm:col-span-1"
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
        >
          <option value="">科目：全て</option>
          {ACCOUNT_ITEMS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Sort bar */}
      <div className="flex gap-2 text-xs text-gray-500">
        <span>並び替え：</span>
        {(["date", "amount", "storeName"] as SortKey[]).map((k) => (
          <button
            key={k}
            onClick={() => toggleSort(k)}
            className={`px-2 py-0.5 rounded-full border transition-colors ${
              sortKey === k
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {k === "date" ? "日付" : k === "amount" ? "金額" : "店名"}
            <SortIcon k={k} />
          </button>
        ))}
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          経費が見つかりません
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {sorted.map((e) => (
            <div key={e.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-800">{e.storeName}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{e.accountItem}</span>
                    {e.imageBase64 && (
                      <button
                        onClick={() => setPreviewImage(e.imageBase64!)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        📷
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{e.date}{e.description && ` · ${e.description}`}{e.memo && ` · ${e.memo}`}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-sm text-gray-900">¥{e.amount.toLocaleString()}</span>
                  <button
                    onClick={() => setEditTarget(e)}
                    className="text-xs text-gray-400 hover:text-blue-600 px-1.5 py-0.5 rounded"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-xs text-gray-400 hover:text-red-600 px-1.5 py-0.5 rounded"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <EditModal
          expense={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-sm w-full">
            <Image
              src={previewImage}
              alt="レシート"
              width={400}
              height={600}
              className="w-full rounded-xl object-contain max-h-[80vh]"
              unoptimized
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 text-sm shadow"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
