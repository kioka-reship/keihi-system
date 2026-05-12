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
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(initialName);
  const [phone, setPhone]       = useState(initialPhone);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deleting, setDeleting] = useState(false);

  // ── 保存 ──────────────────────────────────────────
  async function handleSave() {
    if (!name.trim())  { setSaveError("氏名を入力してください"); return; }
    if (!phone.trim()) { setSaveError("電話番号を入力してください"); return; }
    setSaving(true);
    setSaveError("");

    const res = await fetch("/api/mypage/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    });

    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSaveError(d.error ?? "保存に失敗しました");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setName(initialName);
    setPhone(initialPhone);
    setSaveError("");
    setEditing(false);
  }

  // ── 退会 ──────────────────────────────────────────
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

  const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">アカウント情報</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            編集
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          {saveError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              {saveError}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">氏名</label>
            <input
              className={inputCls}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">電話番号</label>
            <input
              className={inputCls}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="090-0000-0000"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中…" : "保存"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600 space-y-2">
          <Row label="氏名"         value={name  || "—"} />
          <Row label="電話番号"     value={phone || "—"} />
          <Row label="メールアドレス" value={email} />
        </div>
      )}

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
