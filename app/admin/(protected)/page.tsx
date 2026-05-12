import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import BackupButton from "./BackupButton";

// プラン別バーの色
const PLAN_COLORS: Record<string, string> = {
  none:     "bg-gray-300",
  free:     "bg-gray-400",
  light:    "bg-blue-400",
  standard: "bg-blue-600",
  pro:      "bg-purple-600",
};

function getPast6Months(): string[] {
  const months: string[] = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const t = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = `${yearMonth}-01`;
  const past6 = getPast6Months();
  const sixMonthsAgoTs = Math.floor(new Date(past6[0] + "-01").getTime() / 1000);

  // 全プロフィール（プラン分布用）
  const { data: profiles } = await admin
    .from("profiles")
    .select("plan, created_at")
    .order("created_at", { ascending: false });

  const allProfiles = profiles ?? [];

  // 今月の新規ユーザー
  const newUsersCount = allProfiles.filter(p => p.created_at >= monthStart).length;

  // Stripe invoices（過去6ヶ月・paid のみ）
  const invoicesRes = await stripe.invoices.list({
    limit: 100,
    status: "paid",
    created: { gte: sixMonthsAgoTs },
  });

  // 月別サブスク売上集計
  const monthlySubRevenue: Record<string, number> = {};
  for (const inv of invoicesRes.data) {
    const d = new Date(inv.created * 1000);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlySubRevenue[ym] = (monthlySubRevenue[ym] ?? 0) + inv.amount_paid;
  }

  // OP購入（過去6ヶ月）
  let creditPurchases: { amount_yen: number; created_at: string }[] = [];
  try {
    const { data } = await admin
      .from("credit_purchases")
      .select("amount_yen, created_at")
      .gte("created_at", past6[0] + "-01");
    creditPurchases = data ?? [];
  } catch { /* テーブル未作成時は空 */ }

  // 月別OP売上集計
  const monthlyOpRevenue: Record<string, number> = {};
  for (const cp of creditPurchases) {
    const ym = cp.created_at.slice(0, 7);
    monthlyOpRevenue[ym] = (monthlyOpRevenue[ym] ?? 0) + cp.amount_yen;
  }

  // 今月の数値
  const subRevenueThisMonth = monthlySubRevenue[yearMonth] ?? 0;
  const opThisMonth = creditPurchases.filter(cp => cp.created_at >= monthStart);
  const opCountThisMonth = opThisMonth.length;
  const opRevenueThisMonth = opThisMonth.reduce((s, cp) => s + cp.amount_yen, 0);

  // 月別合計売上（チャート用）
  const monthlyTotal = past6.map(ym => ({
    ym,
    total: (monthlySubRevenue[ym] ?? 0) + (monthlyOpRevenue[ym] ?? 0),
  }));
  const maxRevenue = Math.max(...monthlyTotal.map(m => m.total), 1);

  // プラン別人数
  const planKeys: PlanKey[] = ["none", "free", "light", "standard", "pro"];
  const planCounts = planKeys.map(k => ({
    key: k,
    label: PLAN_CONFIG[k].label,
    count: allProfiles.filter(p => p.plan === k).length,
  }));
  const maxPlanCount = Math.max(...planCounts.map(p => p.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">{yearMonth} · 全ユーザー {allProfiles.length}名</p>
        </div>
        <BackupButton />
      </div>

      {/* サマリーカード 4枚 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "今月の新規ユーザー",  value: `${newUsersCount}名`,                       color: "text-blue-600" },
          { label: "今月の売上合計",       value: `¥${(subRevenueThisMonth + opRevenueThisMonth).toLocaleString()}`, color: "text-green-600" },
          { label: "今月のOP追加購入数",   value: `${opCountThisMonth}件`,                   color: "text-purple-600" },
          { label: "今月のOP追加購入額",   value: `¥${opRevenueThisMonth.toLocaleString()}`,  color: "text-purple-600" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
            <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 月別売上推移（過去6ヶ月） */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">月別売上推移（過去6ヶ月）</h2>
          <div className="space-y-3">
            {monthlyTotal.map(({ ym, total }) => {
              const pct = maxRevenue > 0 ? (total / maxRevenue) * 100 : 0;
              return (
                <div key={ym} className="flex items-center gap-3">
                  <span className="w-14 text-xs text-gray-500 text-right shrink-0">
                    {ym.slice(5)}月
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5">
                    <div
                      className="bg-blue-500 h-5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-24 text-xs text-gray-600 text-right shrink-0">
                    ¥{total.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* プラン別ユーザー分布 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">プラン別ユーザー分布</h2>
          <div className="space-y-3">
            {planCounts.map(({ key, label, count }) => {
              const pct = maxPlanCount > 0 ? (count / maxPlanCount) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-500 text-right shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5">
                    <div
                      className={`h-5 rounded-full transition-all ${PLAN_COLORS[key] ?? "bg-gray-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-xs text-gray-600 text-right shrink-0">{count}名</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
