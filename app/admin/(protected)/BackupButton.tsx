"use client";

import { useState } from "react";

export default function BackupButton() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleBackup() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error ?? "バックアップに失敗しました", false);
        return;
      }

      // ファイル名をレスポンスヘッダーから取得
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match?.[1] ?? "keihi-backup.json";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      showToast("バックアップをダウンロードしました", true);
    } catch {
      showToast("ネットワークエラーが発生しました", false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleBackup}
        disabled={loading}
        className="flex items-center gap-2 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            取得中…
          </>
        ) : (
          <>⬇ データバックアップ</>
        )}
      </button>

      {toast && (
        <div
          className={`absolute top-full mt-2 right-0 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap z-50 ${
            toast.ok
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.ok ? "✓ " : "✗ "}{toast.msg}
        </div>
      )}
    </div>
  );
}
