"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FreeTrialButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleFreeTrial() {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ plan: "free" })
      .eq("id", userId);

    if (error) {
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
