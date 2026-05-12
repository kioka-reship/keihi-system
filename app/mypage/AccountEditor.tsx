"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  initialName: string;
  initialPhone: string;
  email: string;
}

export default function AccountEditor({ initialName, initialPhone, email }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("退会すると全てのデータが削除されます。本当に退会しますか？")) return;
    if (!window.confirm("この操作は取り消せません。退会を確定しますか？")) return;

    setDeleting(true);
    const res = await fetch("/api/mypage/delete-account", { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "退会処理に失敗しました。サポートにお問い合わせください。");
      setDeleting(false);
      return;
    }
    router.push("/auth/login");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-700">アカウント情報</p>

      <div className="text-sm text-gray-600 space-y-2">
        <Row label="氏名"           value={initialName  || "—"} />
        <Row label="電話番号"       value={initialPhone || "—"} />
        <Row label="メールアドレス" value={email} />
      </div>

      {/* パスワード変更 */}
      <div className="pt-1 border-t border-gray-100">
        <Link
          href="/auth/reset-password"
          className="text-sm text-blue-600 hover:underline"
        >
          パスワードを変更する →
        </Link>
      </div>

      {/* 退会 */}
      <div className="pt-1 border-t border-gray-100">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
        >
          {deleting ? "処理中…" : "退会する"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}
