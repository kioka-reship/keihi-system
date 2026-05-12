import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { PLAN_CONFIG } from "@/lib/plans";

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const yearMonth = params.month ?? currentYm;
  const [y, m] = yearMonth.split("-").map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd   = new Date(y, m, 1);
  const monthStartTs = Math.floor(monthStart.getTime() / 1000);
  const monthEndTs   = Math.floor(monthEnd.getTime()   / 1000);
  const monthStartStr = yearMonth + "-01";

  const admin = createAdminClient();

  // 新規ユーザー
  const { data: newUsers } = await admin
    .from("profiles")
    .select("id, plan, created_at")
    .gte("created_at", monthStartStr)
    .lt("created_at", `${shiftMonth(yearMonth, 1)}-01`);

  const newUsersCount = (newUsers ?? []).length;

  // プラン別内訳（有料のみ）
  const planCounts: Record<string, number> = { light: 0, standard: 0, pro: 0 };
  for (const u of newUsers ?? []) {
    if (u.plan in planCounts) planCounts[u.plan]++;
  }

  // Stripe invoices（当月 paid）
  const invoicesRes = await stripe.invoices.list({
    limit: 100,
    status: "paid",
    created: { gte: monthStartTs, lt: monthEndTs },
  });

  const invoices = invoicesRes.data.map(inv => {
    const rawPrice = inv.lines.data[0]?.pricing?.price_details?.price;
    const priceId  = typeof rawPrice === "string" ? rawPrice : (rawPrice?.id ?? "");
    const planKey  = getPlanFromPriceId(priceId);
    return {
      id:             inv.id,
      customer_email: inv.customer_email ?? "—",
      amount_paid:    inv.amount_paid,
      created:        inv.created,
      plan_label:     planKey !== "none" ? PLAN_CONFIG[planKey].label : "—",
    };
  });

  const subRevenue = invoices.reduce((s, inv) => s + inv.amount_paid, 0);

  // OP購入
  let opCount = 0;
  let opRevenue = 0;
  try {
    const { data: opPurchases } = await admin
      .from("credit_purchases")
      .select("amount_yen")
      .gte("created_at", monthStartStr)
      .lt("created_at", `${shiftMonth(yearMonth, 1)}-01`);
    opCount   = (opPurchases ?? []).length;
    opRevenue = (opPurchases ?? []).reduce((s, cp) => s + cp.amount_yen, 0);
  } catch { /* テーブル未作成時は0 */ }

  const prevMonth = shiftMonth(yearMonth, -1);
  const nextMonth = shiftMonth(yearMonth, 1);
  const isCurrentOrFuture = yearMonth >= currentYm;

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">売上・統計</h1>
        </div>
        {/* 月ナビ */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
          <Link
            href={`/admin/stats?month=${prevMonth}`}
            className="text-gray-500 hover:text-gray-900 font-medium px-1"
          >
            ◀
          </Link>
          <span className="text-sm font-semibold text-gray-800 w-24 text-center">
            {y}年{m}月
          </span>
          <Link
            href={isCurrentOrFuture ? "#" : `/admin/stats?month=${nextMonth}`}
            className={`font-medium px-1 ${isCurrentOrFuture ? "text-gray-200 cursor-default" : "text-gray-500 hover:text-gray-900"}`}
          >
            ▶
          </Link>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "売上合計（サブスク+OP）", value: `¥${(subRevenue + opRevenue).toLocaleString()}`, color: "text-green-600" },
          { label: "新規ユーザー",             value: `${newUsersCount}名`,                            color: "text-blue-600"  },
          { label: "OP購入数",                 value: `${opCount}件`,                                  color: "text-purple-600" },
          { label: "OP購入額",                 value: `¥${opRevenue.toLocaleString()}`,                color: "text-purple-600" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
            <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* プラン別内訳（有料プランの新規） */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">当月新規ユーザーのプラン内訳</h2>
        <div className="flex gap-6 flex-wrap">
          {[
            { key: "light",    label: PLAN_CONFIG.light.label },
            { key: "standard", label: PLAN_CONFIG.standard.label },
            { key: "pro",      label: PLAN_CONFIG.pro.label },
          ].map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{planCounts[key]}件</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe invoices 一覧 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Stripe請求履歴</h2>
          <span className="text-xs text-gray-400">{invoices.length}件 · 合計 ¥{subRevenue.toLocaleString()}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                {["日付", "金額", "メール", "プラン"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(inv.created * 1000).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ¥{inv.amount_paid.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate">
                    {inv.customer_email}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{inv.plan_label}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    この月の請求データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
