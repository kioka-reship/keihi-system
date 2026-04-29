"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Expense, ACCOUNT_ITEMS } from "@/types";
import { loadExpenses, updateExpense, deleteExpense } from "@/lib/storage";
import { downloadCSV } from "@/lib/csv";
import EditModal from "@/components/EditModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import SkeletonCard from "@/components/SkeletonCard";

type SortKey = "date" | "amount" | "storeName";
type SortDir = "asc" | "desc";

const currentYearMonth = () => new Date().toISOString().slice(0, 7); // "2026-04"

const EMPTY_SUB = { keyword: "", account: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "" };

function formatYearMonth(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}年${Number(m)}月`;
}

export default function ListPage() {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [month, setMonth]           = useState(currentYearMonth());
  const [sub, setSub]               = useState(EMPTY_SUB);
  const [sortKey, setSortKey]       = useState<SortKey>("date");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [editTarget, setEditTarget]     = useState<Expense | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState(false);

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

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  }

  function setSubFilter(key: keyof typeof EMPTY_SUB, value: string) {
    setSub(prev => ({ ...prev, [key]: value }));
  }

  // 月ドロップダウン用: データ内の年月 + 当月
  const monthOptions = useMemo(() => {
    const set = new Set(expenses.map(e => e.date.slice(0, 7)));
    set.add(currentYearMonth());
    return [...set].sort().reverse();
  }, [expenses]);

  // 追加フィルターのアクティブ数（月フィルター除く）
  const subCount = Object.values(sub).filter(Boolean).length;

  // フィルタリング
  const filtered = useMemo(() => {
    const kw     = sub.keyword.toLowerCase();
    const minAmt = sub.amountMin ? Number(sub.amountMin) : null;
    const maxAmt = sub.amountMax ? Number(sub.amountMax) : null;
    // 日付範囲: サブフィルターが未設定なら月フィルターを使う
    const from = sub.dateFrom || (month ? `${month}-01` : "");
    const to   = sub.dateTo   || (month ? `${month}-31` : "");

    return expenses.filter(e => {
      if (from && e.date < from) return false;
      if (to   && e.date > to)   return false;
      if (sub.account && e.accountItem !== sub.account) return false;
      if (minAmt !== null && e.amount < minAmt) return false;
      if (maxAmt !== null && e.amount > maxAmt) return false;
      if (kw && ![e.storeName, e.description, e.memo].join(" ").toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [expenses, month, sub]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let v = 0;
    if      (sortKey === "date")      v = a.date.localeCompare(b.date);
    else if (sortKey === "amount")    v = a.amount - b.amount;
    else if (sortKey === "storeName") v = a.storeName.localeCompare(b.storeName, "ja");
    return sortDir === "asc" ? v : -v;
  }), [filtered, sortKey, sortDir]);

  const total = useMemo(() => sorted.reduce((s, e) => s + e.amount, 0), [sorted]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">経費一覧</h1>
        </div>
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
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
          onClick={() => downloadCSV(sorted, `経費_${month || "全期間"}.csv`)}
          disabled={sorted.length === 0}
          className="bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
        >
          ⬇ CSV
        </button>
      </div>

      {/* 月別ドロップダウン（プライマリフィルター） */}
      <div className="flex gap-2">
        <select
          value={month}
          onChange={e => { setMonth(e.target.value); setSub(EMPTY_SUB); }}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {monthOptions.map(ym => (
            <option key={ym} value={ym}>{formatYearMonth(ym)}</option>
          ))}
        </select>

        {/* キーワード検索 */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="キーワード検索…"
            value={sub.keyword}
            onChange={e => setSubFilter("keyword", e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 詳細フィルターボタン */}
        <button
          onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-1.5 border rounded-xl px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            open || subCount > 0
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          絞り込み
          {subCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {subCount}
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
              value={sub.account}
              onChange={e => setSubFilter("account", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">すべての科目</option>
              {ACCOUNT_ITEMS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* 日付範囲（月フィルターを上書き） */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">日付範囲（設定すると月フィルターを上書き）</label>
            <div className="flex items-center gap-2">
              <input type="date" value={sub.dateFrom} onChange={e => setSubFilter("dateFrom", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <span className="text-gray-400 text-xs shrink-0">〜</span>
              <input type="date" value={sub.dateTo} onChange={e => setSubFilter("dateTo", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* 金額範囲 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">金額範囲</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">¥</span>
                <input type="number" placeholder="最小" min={0} value={sub.amountMin}
                  onChange={e => setSubFilter("amountMin", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <span className="text-gray-400 text-xs shrink-0">〜</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">¥</span>
                <input type="number" placeholder="最大" min={0} value={sub.amountMax}
                  onChange={e => setSubFilter("amountMax", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
          </div>

          {subCount > 0 && (
            <button
              onClick={() => setSub(EMPTY_SUB)}
              className="w-full text-xs text-red-500 hover:text-red-700 py-1.5 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
            >
              詳細フィルターをリセット
            </button>
          )}
        </div>
      )}

      {/* アクティブフィルターバッジ */}
      {subCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sub.keyword && <FilterBadge label={`"${sub.keyword}"`} onRemove={() => setSubFilter("keyword", "")} />}
          {sub.account && <FilterBadge label={sub.account} onRemove={() => setSubFilter("account", "")} />}
          {(sub.dateFrom || sub.dateTo) && (
            <FilterBadge
              label={`${sub.dateFrom || "…"} 〜 ${sub.dateTo || "…"}`}
              onRemove={() => { setSubFilter("dateFrom", ""); setSubFilter("dateTo", ""); }}
            />
          )}
          {(sub.amountMin || sub.amountMax) && (
            <FilterBadge
              label={`¥${sub.amountMin || "0"} 〜 ¥${sub.amountMax || "∞"}`}
              onRemove={() => { setSubFilter("amountMin", ""); setSubFilter("amountMax", ""); }}
            />
          )}
        </div>
      )}

      {/* 並び替え */}
      <div className="flex gap-2 text-xs text-gray-500 items-center">
        <span>並び替え：</span>
        {(["date", "amount", "storeName"] as SortKey[]).map(k => (
          <button key={k} onClick={() => toggleSort(k)}
            className={`px-2 py-0.5 rounded-full border transition-colors ${
              sortKey === k ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
            {k === "date" ? "日付" : k === "amount" ? "金額" : "店名"}
            {sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            {subCount > 0 ? "条件に一致する経費が見つかりません" : `${formatYearMonth(month)}の経費はありません`}
          </p>
          {subCount > 0 && (
            <button onClick={() => setSub(EMPTY_SUB)} className="text-xs text-blue-500 underline">
              詳細フィルターをリセット
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {sorted.map(e => (
            <div key={e.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                {/* サムネイル */}
                {e.imageUrl ? (
                  <button
                    onClick={() => setPreviewUrl(e.imageUrl!)}
                    className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                    title="クリックで拡大"
                  >
                    <Image
                      src={e.imageUrl}
                      alt="レシート"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>
                ) : (
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 text-xl">
                    🧾
                  </div>
                )}

                {/* 内容 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <EditModal expense={editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />
      )}

      {previewUrl && (
        <ImagePreviewModal src={previewUrl} onClose={() => setPreviewUrl(null)} />
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
