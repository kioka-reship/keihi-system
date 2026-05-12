"use client";

import { useState, useMemo } from "react";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import AdminActions from "../../AdminActions";
import type { UserRow, ReferralCodeRow } from "./page";

const PLAN_BADGE: Record<string, string> = {
  none:     "bg-gray-100 text-gray-500",
  free:     "bg-gray-100 text-gray-600",
  light:    "bg-blue-100 text-blue-700",
  standard: "bg-blue-100 text-blue-800",
  pro:      "bg-purple-100 text-purple-700",
};

interface Props {
  users: UserRow[];
  referralCodes: ReferralCodeRow[];
}

export default function UsersClient({ users, referralCodes }: Props) {
  const [search, setSearch]       = useState("");
  const [planFilter, setPlan]     = useState("");
  const [refFilter, setRef]       = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      if (planFilter && u.plan !== planFilter) return false;
      if (refFilter && u.referred_by !== refFilter) return false;
      const display = u.full_name ?? u.name ?? "";
      if (q && ![u.email, display, u.phone ?? ""].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, planFilter, refFilter]);

  function downloadCSV() {
    const header = ["氏名", "メール", "電話番号", "プラン", "申し込み日", "紹介コード", "使用枚数"];
    const rows = filtered.map(u => [
      u.full_name ?? u.name ?? "",
      u.email,
      u.phone ?? "",
      u.plan,
      new Date(u.created_at).toLocaleDateString("ja-JP"),
      u.referred_by ?? "",
      String(u.monthly_count),
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="氏名・メール・電話で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={planFilter}
          onChange={e => setPlan(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">全プラン</option>
          {(Object.keys(PLAN_CONFIG) as PlanKey[]).map(k => (
            <option key={k} value={k}>{PLAN_CONFIG[k].label}</option>
          ))}
        </select>
        <select
          value={refFilter}
          onChange={e => setRef(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">全紹介コード</option>
          {referralCodes.map(r => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400">{filtered.length}件</span>
        <button
          onClick={downloadCSV}
          className="ml-auto bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors shrink-0"
        >
          ⬇ CSV出力
        </button>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {["氏名", "メール", "電話番号", "プラン", "申し込み日", "紹介コード", "使用枚数", "操作"].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => {
                const planKey = (u.plan || "none") as PlanKey;
                const cfg = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.none;
                const displayName = u.full_name ?? u.name;
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                      {displayName ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[180px] truncate">{u.email}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                      {u.phone ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${PLAN_BADGE[planKey] ?? PLAN_BADGE.none}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-blue-700 whitespace-nowrap">
                      {u.referred_by ?? <span className="text-gray-300 font-sans">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                      {u.monthly_count}/{cfg.monthlyLimit}枚
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <AdminActions userId={u.id} currentPlan={planKey} currentExtra={u.extra_credits} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    該当するユーザーが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
