"use client";

import { useState } from "react";
import { PlanKey } from "@/lib/plans";

interface Props {
  planKey: PlanKey;
  isCurrent: boolean;
  hasSubscription: boolean;
}

export default function PlanButton({ planKey, isCurrent, hasSubscription }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "エラーが発生しました");
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "エラーが発生しました");
      setLoading(false);
    }
  }

  if (isCurrent && hasSubscription) {
    return (
      <button
        onClick={handleManage}
        disabled={loading}
        className="w-full border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "処理中…" : "管理・解約"}
      </button>
    );
  }

  if (!isCurrent && hasSubscription) {
    return (
      <button
        onClick={handleManage}
        disabled={loading}
        className="w-full border border-blue-400 text-blue-600 rounded-xl py-2.5 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "処理中…" : "このプランに変更"}
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "処理中…" : "このプランを選択"}
    </button>
  );
}
