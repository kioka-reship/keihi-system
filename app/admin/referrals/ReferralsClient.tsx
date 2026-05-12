"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReferralCode } from "./page";

interface Props {
  referralCodes: ReferralCode[];
}

export default function ReferralsClient({ referralCodes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 追加フォーム
  const [code, setCode]       = useState("");
  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [adding, setAdding]   = useState(false);
  const [addError, setAddError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setAdding(true);
    setAddError("");
    const res = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), name: name.trim(), description: desc.trim() || null }),
    });
    setAdding(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAddError(data.error ?? "追加に失敗しました");
      return;
    }
    setCode(""); setName(""); setDesc("");
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string, codeName: string, userCount: number) {
    if (userCount > 0) {
      if (!window.confirm(`「${codeName}」を使って登録したユーザーが${userCount}名います。本当に削除しますか？`)) return;
    } else {
      if (!window.confirm(`「${codeName}」を削除しますか？`)) return;
    }
    await fetch(`/api/admin/referrals/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  return (
    <div className="space-y-6">
      {/* 追加フォーム */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">新規コード追加</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">コード <span className="text-red-500">*</span></label>
            <input
              required
              className={inputCls + " w-36"}
              placeholder="FRIEND2026"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">名前（管理用） <span className="text-red-500">*</span></label>
            <input
              required
              className={inputCls + " w-40"}
              placeholder="友人紹介"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs text-gray-500 font-medium">説明（任意）</label>
            <input
              className={inputCls + " w-full"}
              placeholder="2026年春の友人紹介キャンペーン"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={adding || isPending}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors self-end"
          >
            {adding ? "追加中…" : "追加"}
          </button>
        </form>
        {addError && (
          <p className="mt-2 text-xs text-red-600">{addError}</p>
        )}
      </div>

      {/* コード一覧 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
              {["コード", "名前", "説明", "利用者数", "作成日", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {referralCodes.map(rc => (
              <tr key={rc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-blue-700">{rc.code}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{rc.name}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate">
                  {rc.description ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${rc.user_count > 0 ? "text-blue-600" : "text-gray-400"}`}>
                    {rc.user_count}名
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(rc.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(rc.id, rc.name, rc.user_count)}
                    disabled={isPending}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {referralCodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  紹介コードがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
