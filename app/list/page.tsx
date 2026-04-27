"use client";

import { useEffect, useState, useMemo } from "react";
import { Expense, ACCOUNT_ITEMS, AccountItem } from "@/types";
import { loadExpenses, updateExpense, deleteExpense } from "@/lib/storage";
import { downloadCSV } from "@/lib/csv";
import EditModal from "@/components/EditModal";

type SortKey = "date" | "amount" | "storeName";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS = {
  keyword:   "",
  account:   "",
  dateFrom:  "",
  dateTo:    "",
  amountMin: "",
  amountMax: "",
};

export default function ListPage() {
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [filters, setFilters]     = useState(EMPTY_FILTERS);
  const [sortKey, setSortKey]     = useState<SortKey>("date");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);

  async function refresh() {
    const data = await loadExpenses();
    setExpenses(data);
  }

  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    if (!confirm("この経費を削除しますか？")) return;
    await deleteExpense(id);
    await refresh();
  }

  async function handleSave(updated: Expense) {
    await updateExpense(updated);
    setEditTarget(null);
    await refresh();
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function setFilter(key: keyof typeof EMPTY_FILTERS, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    const kw      = filters.keyword.toLowerCase();
    const minAmt  = filters.amountMin ? Number(filters.amountMin) : null;
    const maxAmt  = filters.amountMax ? Number(filters.amountMax) : null;

    return expenses.filter((e) => {
      if (filters.account && e.accountItem !== filters.account) return false;
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo   && e.date > filters.dateTo)   return false;
      if (minAmt !== null && e.amount < minAmt) return false;
      if (maxAmt !== null && e.amount > maxAmt) return false;
      if (kw && ![e.storeName, e.description, e.memo].join(" ").toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [expenses, filters]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let v = 0;
    if      (sortKey === "date")      v = a.date.localeCompare(b.date);
    else if (sortKey === "amount")    v = a.amount - b.amount;
    else if (sortKey === "storeName") v = a.storeName.localeCompare(b.storeName, "ja");
    return sortDir === "asc" ? v : -v;
  }), [filtered, sortKey, sortDir]);

  const total = useMemo(() => sorted.reduce((s, e) => s + e.amount, 0), [sorted]);

  const SortIcon = ({ k }: { k: SortKey }) =>
    <>{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">経費一覧</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sorted.length}件 / ¥{total.toLocaleString()}</p>
        </div>
        <button
          onClick={() => downloadCSV(sorted, `経費_${filters.dateFrom || "全期間"}.csv`)}
          disabled={sorted.length === 0}
          className="bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
        >
          ⬇ CSV
        </button>
      </div>

      {/* キーワード検索 + フィルター展開ボタン */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="店名・内容・メモで検索…"
            value={filters.keyword}
            onChange={(e) => setFilter("keyword", e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 border rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            open || activeCount > 0
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>絞り込み</span>
          {activeCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* 詳細フィルターパネル */}
      {open && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          {/* 科目 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">勘定科目</label>
            <select
              value={filters.account}
              onChange={(e) => setFilter("account", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">すべての科目</option>
              {ACCOUNT_ITEMS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* 日付範囲 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">日付範囲</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-gray-400 text-xs shrink-0">〜</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter("dateTo", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* 金額範囲 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">金額範囲</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">¥</span>
                <input
                  type="number"
                  placeholder="最小"
                  min={0}
                  value={filters.amountMin}
                  onChange={(e) => setFilter("amountMin", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <span className="text-gray-400 text-xs shrink-0">〜</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">¥</span>
                <input
                  type="number"
                  placeholder="最大"
                  min={0}
                  value={filters.amountMax}
                  onChange={(e) => setFilter("amountMax", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* リセット */}
          {activeCount > 0 && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="w-full text-xs text-red-500 hover:text-red-700 py-1.5 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
            >
              フィルターをリセット
            </button>
          )}
        </div>
      )}

      {/* アクティブフィルターのバッジ */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.keyword && (
            <FilterBadge label={`"${filters.keyword}"`} onRemove={() => setFilter("keyword", "")} />
          )}
          {filters.account && (
            <FilterBadge label={filters.account} onRemove={() => setFilter("account", "")} />
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <FilterBadge
              label={`${filters.dateFrom || "…"} 〜 ${filters.dateTo || "…"}`}
              onRemove={() => { setFilter("dateFrom", ""); setFilter("dateTo", ""); }}
            />
          )}
          {(filters.amountMin || filters.amountMax) && (
            <FilterBadge
              label={`¥${filters.amountMin || "0"} 〜 ¥${filters.amountMax || "∞"}`}
              onRemove={() => { setFilter("amountMin", ""); setFilter("amountMax", ""); }}
            />
          )}
        </div>
      )}

      {/* 並び替え */}
      <div className="flex gap-2 text-xs text-gray-500 items-center">
        <span>並び替え：</span>
        {(["date", "amount", "storeName"] as SortKey[]).map((k) => (
          <button key={k} onClick={() => toggleSort(k)}
            className={`px-2 py-0.5 rounded-full border transition-colors ${
              sortKey === k ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
            {k === "date" ? "日付" : k === "amount" ? "金額" : "店名"}
            <SortIcon k={k} />
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            {activeCount > 0 ? "条件に一致する経費が見つかりません" : "経費が見つかりません"}
          </p>
          {activeCount > 0 && (
            <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs text-blue-500 underline">
              フィルターをリセット
            </button>
          )}
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
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {e.date}{e.description && ` · ${e.description}`}{e.memo && ` · ${e.memo}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-sm text-gray-900">¥{e.amount.toLocaleString()}</span>
                  <button onClick={() => setEditTarget(e)} className="text-xs text-gray-400 hover:text-blue-600 px-1.5 py-0.5 rounded">編集</button>
                  <button onClick={() => handleDelete(e.id)} className="text-xs text-gray-400 hover:text-red-600 px-1.5 py-0.5 rounded">削除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <EditModal expense={editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs rounded-full px-2.5 py-1 border border-blue-100">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900 leading-none">✕</button>
    </span>
  );
}
