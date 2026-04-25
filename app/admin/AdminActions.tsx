"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";

interface Props {
  userId: string;
  currentPlan: PlanKey;
  currentExtra: number;
}

export default function AdminActions({ userId, currentPlan, currentExtra }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanKey>(currentPlan);
  const [extra, setExtra] = useState(currentExtra);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/users/" + userId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, extraCredits: extra }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <select
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={plan}
        onChange={(e) => setPlan(e.target.value as PlanKey)}
      >
        {(Object.entries(PLAN_CONFIG) as [PlanKey, typeof PLAN_CONFIG[PlanKey]][]).map(([key, config]) => (
          <option key={key} value={key}>{config.label}</option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-16 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={extra}
        onChange={(e) => setExtra(Number(e.target.value))}
        title="追加クレジット"
        placeholder="追加"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white rounded-lg px-3 py-1 text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "…" : "保存"}
      </button>
    </div>
  );
}
