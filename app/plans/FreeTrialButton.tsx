"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FreeTrialButton({ userId: _userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleFreeTrial() {
    setLoading(true);

    const res = await fetch("/api/plans/activate-free", { method: "POST" });

    if (!res.ok) {
      alert("エラーが発生しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <button
      onClick={handleFreeTrial}
      disabled={loading}
      className="w-full border border-gray-300 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      {loading ? "処理中…" : "お試し（無料・月3枚）で始める"}
    </button>
  );
}
