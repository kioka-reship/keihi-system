"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountItem, ReceiptAnalysis } from "@/types";
import { addExpense } from "@/lib/storage";
import ReceiptUploader from "@/components/ReceiptUploader";
import AnalysisResult from "@/components/AnalysisResult";
import Link from "next/link";

type Step = "upload" | "analyzing" | "confirm" | "manual";

const today = () => new Date().toISOString().split("T")[0];

const defaultValues = () => ({
  date: today(),
  storeName: "",
  amount: "",
  description: "",
  accountItem: "雑費" as AccountItem,
  memo: "",
});

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [analysis, setAnalysis] = useState<ReceiptAnalysis | null>(null);
  const [values, setValues] = useState(defaultValues());
  const [error, setError] = useState<string>("");
  const [limitReached, setLimitReached] = useState(false);

  function handleImageSelect(base64: string, mt: string) {
    setImageBase64(base64);
    setMediaType(mt);
    setError("");
  }

  async function handleAnalyze() {
    if (!imageBase64) {
      setError("画像を選択してください");
      return;
    }
    setStep("analyzing");
    setError("");
    setLimitReached(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) setLimitReached(true);
        throw new Error(data.error || "解析失敗");
      }

      setAnalysis(data);
      setValues({
        date: data.date || today(),
        storeName: data.storeName || "",
        amount: String(data.amount || ""),
        description: data.description || "",
        accountItem: data.suggestedAccounts?.[0] || "雑費",
        memo: "",
      });
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析に失敗しました");
      setStep("upload");
    }
  }

  function handleManual() {
    setAnalysis({ date: today(), storeName: "", amount: 0, description: "", suggestedAccounts: ["雑費"] });
    setValues(defaultValues());
    setStep("manual");
  }

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.storeName || !values.amount || !values.date) {
      setError("日付・店名・金額は必須です");
      return;
    }
    await addExpense({
      date: values.date,
      storeName: values.storeName,
      amount: Number(values.amount),
      accountItem: values.accountItem,
      description: values.description,
      memo: values.memo,
    });
    router.push("/");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">経費を登録</h1>
        <p className="text-sm text-gray-500 mt-0.5">レシートをAIで解析して自動入力</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200 space-y-1">
          <p>{error}</p>
          {limitReached && (
            <p className="text-xs">
              プランのアップグレードは{" "}
              <Link href="/admin" className="underline">管理画面</Link>
              からお問い合わせください。
            </p>
          )}
        </div>
      )}

      {(step === "upload" || step === "analyzing") && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <ReceiptUploader onImageSelect={handleImageSelect} />
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!imageBase64 || step === "analyzing"}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {step === "analyzing" ? "🔍 解析中…" : "🔍 AIで解析する"}
            </button>
            <button
              onClick={handleManual}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              手動で入力
            </button>
          </div>
        </div>
      )}

      {(step === "confirm" || step === "manual") && analysis && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
          <AnalysisResult analysis={analysis} values={values} onChange={handleChange} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep("upload"); setError(""); }}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
            >
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
