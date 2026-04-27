"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AccountItem, ACCOUNT_ITEMS, ReceiptAnalysis } from "@/types";
import { addExpense } from "@/lib/storage";
import ReceiptUploader from "@/components/ReceiptUploader";
import AnalysisResult from "@/components/AnalysisResult";
import LimitReachedModal from "@/components/LimitReachedModal";

const MAX_SLOTS = 5;
const today = () => new Date().toISOString().split("T")[0];

type Slot = { id: number; base64: string; mediaType: string; preview: string };
type FormValues = { date: string; storeName: string; amount: string; description: string; accountItem: AccountItem; memo: string };
type ResultItem = { slotId: number; preview: string; analysis: ReceiptAnalysis; values: FormValues; skip: boolean };
type Step = "upload" | "analyzing" | "confirm" | "manual";

let nextId = 1;
const newSlot = (): Slot => ({ id: nextId++, base64: "", mediaType: "image/jpeg", preview: "" });
const toFormValues = (a: ReceiptAnalysis): FormValues => ({
  date: a.date || today(),
  storeName: a.storeName || "",
  amount: String(a.amount || ""),
  description: a.description || "",
  accountItem: a.suggestedAccounts?.[0] || "雑費",
  memo: "",
});

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]         = useState<Step>("upload");
  const [slots, setSlots]       = useState<Slot[]>([newSlot()]);
  const [results, setResults]   = useState<ResultItem[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [limitModal, setLimitModal] = useState<{ plan: string; limit: number; remaining: number } | null>(null);

  // --- マニュアル入力用（1枚） ---
  const [manualValues, setManualValues] = useState<FormValues>({
    date: today(), storeName: "", amount: "", description: "", accountItem: "雑費", memo: "",
  });

  // スロット操作
  function setSlotImage(id: number, base64: string, mediaType: string, preview: string) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, base64, mediaType, preview } : s));
  }
  const addSlot = () => { if (slots.length < MAX_SLOTS) setSlots(prev => [...prev, newSlot()]); };
  const removeSlot = (id: number) => {
    setSlots(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev.map(s => s.id === id ? { ...s, base64: "", preview: "" } : s));
  };

  // 解析API呼び出し
  async function callAnalyze(slot: Slot, count: number) {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: slot.base64, mediaType: slot.mediaType, count }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error, limitReached: data.limitReached, plan: data.plan, limit: data.limit, remaining: data.remaining };
    return { data: data as ReceiptAnalysis };
  }

  async function handleAnalyzeAll() {
    const filled = slots.filter(s => s.base64);
    if (filled.length === 0) { setError("画像を選択してください"); return; }

    setStep("analyzing");
    setError("");
    setLimitModal(null);
    setProgress({ done: 0, total: filled.length });

    // 1枚目: count=N で上限確認 + 全枚数分カウント更新
    const first = await callAnalyze(filled[0], filled.length);
    if (first.limitReached) {
      setLimitModal({ plan: first.plan ?? "none", limit: first.limit ?? 3, remaining: first.remaining ?? 0 });
      setStep("upload");
      return;
    }
    if (first.error || !first.data) {
      setError(first.error ?? "解析に失敗しました");
      setStep("upload");
      return;
    }
    setProgress({ done: 1, total: filled.length });

    // 2枚目以降: count=0（カウント更新なし）を並列処理
    const restResults = await Promise.all(
      filled.slice(1).map(async slot => {
        const r = await callAnalyze(slot, 0);
        setProgress(p => ({ ...p, done: p.done + 1 }));
        return { slot, result: r };
      })
    );

    const items: ResultItem[] = [
      { slotId: filled[0].id, preview: filled[0].preview, analysis: first.data, values: toFormValues(first.data), skip: false },
      ...restResults.map(({ slot, result }) => ({
        slotId: slot.id,
        preview: slot.preview,
        analysis: result.data ?? { date: today(), storeName: "", amount: 0, description: "", suggestedAccounts: ["雑費" as AccountItem] },
        values: result.data ? toFormValues(result.data) : { date: today(), storeName: "", amount: "", description: "", accountItem: "雑費" as AccountItem, memo: "" },
        skip: !!result.error,
      })),
    ];

    setResults(items);
    setStep("confirm");
  }

  function updateResultValues(slotId: number, field: string, value: string) {
    setResults(prev => prev.map(r => r.slotId === slotId ? { ...r, values: { ...r.values, [field]: value } } : r));
  }
  function toggleSkip(slotId: number) {
    setResults(prev => prev.map(r => r.slotId === slotId ? { ...r, skip: !r.skip } : r));
  }

  async function handleSaveAll() {
    const toSave = results.filter(r => !r.skip);
    if (toSave.some(r => !r.values.storeName || !r.values.amount || !r.values.date)) {
      setError("日付・店名・金額は必須です");
      return;
    }
    setSaving(true);
    for (const r of toSave) {
      await addExpense({
        date: r.values.date,
        storeName: r.values.storeName,
        amount: Number(r.values.amount),
        accountItem: r.values.accountItem,
        description: r.values.description,
        memo: r.values.memo,
      });
    }
    router.push("/");
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualValues.storeName || !manualValues.amount || !manualValues.date) {
      setError("日付・店名・金額は必須です");
      return;
    }
    await addExpense({
      date: manualValues.date,
      storeName: manualValues.storeName,
      amount: Number(manualValues.amount),
      accountItem: manualValues.accountItem,
      description: manualValues.description,
      memo: manualValues.memo,
    });
    router.push("/");
  }

  const filledCount = slots.filter(s => s.base64).length;
  const saveCount   = results.filter(r => !r.skip).length;

  // ---- レンダリング ----
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">経費を登録</h1>
        <p className="text-sm text-gray-500 mt-0.5">レシートをAIで解析して自動入力</p>
      </div>

      {limitModal && (
        <LimitReachedModal plan={limitModal.plan} limit={limitModal.limit} remaining={limitModal.remaining}
          onClose={() => setLimitModal(null)} />
      )}

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">{error}</div>
      )}

      {/* ===== UPLOAD ===== */}
      {(step === "upload" || step === "analyzing") && (
        <div className="space-y-3">
          {slots.map((slot, i) => (
            <div key={slot.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">レシート {i + 1}</p>
                {slots.length > 1 && (
                  <button onClick={() => removeSlot(slot.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    削除
                  </button>
                )}
              </div>
              <ReceiptUploader
                key={slot.id}
                onImageSelect={(base64, mt, preview) => setSlotImage(slot.id, base64, mt, preview)}
              />
            </div>
          ))}

          {/* 枠追加ボタン */}
          {slots.length < MAX_SLOTS && (
            <button onClick={addSlot}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/40 transition-colors">
              ＋ レシートを追加（{slots.length}/{MAX_SLOTS}枚）
            </button>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyzeAll}
              disabled={filledCount === 0 || step === "analyzing"}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {step === "analyzing"
                ? `🔍 解析中… ${progress.done}/${progress.total}枚`
                : `🔍 AIで解析する${filledCount > 1 ? `（${filledCount}枚）` : ""}`}
            </button>
            <button onClick={() => setStep("manual")}
              className="border border-gray-300 text-gray-700 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors">
              手動入力
            </button>
          </div>
        </div>
      )}

      {/* ===== CONFIRM ===== */}
      {step === "confirm" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{results.length}枚の解析結果を確認</p>
            <button onClick={() => { setStep("upload"); setError(""); }}
              className="text-xs text-gray-400 hover:text-gray-600">← 戻る</button>
          </div>

          {results.map((r, i) => (
            <div key={r.slotId}
              className={`bg-white rounded-2xl border-2 p-4 space-y-4 transition-colors ${r.skip ? "border-gray-200 opacity-50" : "border-blue-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.preview && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <Image src={r.preview} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                    </div>
                  )}
                  <p className="text-xs font-semibold text-gray-600">レシート {i + 1}</p>
                </div>
                <button onClick={() => toggleSkip(r.slotId)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                    r.skip ? "border-gray-200 text-gray-400 hover:text-gray-600" : "border-red-200 text-red-500 hover:bg-red-50"
                  }`}>
                  {r.skip ? "登録に含める" : "スキップ"}
                </button>
              </div>

              {!r.skip && (
                <AnalysisResult
                  analysis={r.analysis}
                  values={r.values}
                  onChange={(field, val) => updateResultValues(r.slotId, field, val)}
                />
              )}
            </div>
          ))}

          {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">{error}</div>}

          <button
            onClick={handleSaveAll}
            disabled={saving || saveCount === 0}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {saving ? "保存中…" : `${saveCount}件の経費を登録する`}
          </button>
        </div>
      )}

      {/* ===== MANUAL ===== */}
      {step === "manual" && (
        <form onSubmit={handleManualSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "日付", field: "date", type: "date" },
                { label: "店名", field: "storeName", type: "text", placeholder: "店名・会社名" },
                { label: "金額（円）", field: "amount", type: "number", placeholder: "0" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={manualValues[field as keyof FormValues]}
                    onChange={e => setManualValues(p => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">勘定科目</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={manualValues.accountItem}
                  onChange={e => setManualValues(p => ({ ...p, accountItem: e.target.value as AccountItem }))}
                >
                  {ACCOUNT_ITEMS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            {[
              { label: "品目・内容", field: "description", placeholder: "購入品目" },
              { label: "メモ（任意）", field: "memo", placeholder: "補足メモ" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="text" placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={manualValues[field as keyof FormValues]}
                  onChange={e => setManualValues(p => ({ ...p, [field]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep("upload"); setError(""); }}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50">
              戻る
            </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700">
              登録する
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
