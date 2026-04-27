"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("本当に解約しますか？\n解約後はお試しプラン（月3枚）に戻ります。")) return;
    setLoading(true);
    const res = await fetch("/api/stripe/cancel", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      router.refresh();
    } else {
      alert(data.error || "解約処理に失敗しました");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 transition-colors"
    >
      {loading ? "処理中…" : "解約する"}
    </button>
  );
}
