"use client";

import { useState, useMemo } from "react";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import AdminActions from "./AdminActions";

// ─── 型 ───────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  referral_code: string | null;
  plan: string;
  monthly_count: number;
  extra_credits: number;
  is_admin: boolean;
  created_at: string;
  stripe_customer_id: string | null;
}

export interface CreditPurchase {
  id: string;
  user_id: string;
  credits: number;
  amount_yen: number;
  price_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

export interface StripeInvoice {
  id: string;
  customer_email: string | null;
  amount_paid: number;
  status: string | null;
  created: number;
  plan_label: string;
}

interface Props {
  profiles: AdminProfile[];
  usageMap: Record<string, number>;
  expenseMap: Record<string, number>;
  invoices: StripeInvoice[];
  creditPurchases: CreditPurchase[];
  yearMonth: string;
}

const PLAN_PRICES: Record<string, number> = {
  light: 980, standard: 1680, pro: 2980,
};

// ─── メインコンポーネント ────────────────────────────────────

export default function AdminClient({
  profiles, usageMap, expenseMap, invoices, creditPurchases, yearMonth,
}: Props) {
  const [tab, setTab] = useState<"overview" | "users" | "credits">("overview");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">管理者画面</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {yearMonth} · ユーザー {profiles.length}名
        </p>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: "overview", label: "📊 概要" },
          { key: "users",    label: "👥 ユーザー" },
          { key: "credits",  label: "💰 OP購入履歴" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab profiles={profiles} invoices={invoices} creditPurchases={creditPurchases} yearMonth={yearMonth} />}
      {tab === "users"    && <UsersTab profiles={profiles} usageMap={usageMap} expenseMap={expenseMap} />}
      {tab === "credits"  && <CreditsTab creditPurchases={creditPurchases} profiles={profiles} />}
    </div>
  );
}

// ─── 概要タブ ────────────────────────────────────────────────

function OverviewTab({ profiles, invoices, creditPurchases, yearMonth }: {
  profiles: AdminProfile[];
  invoices: StripeInvoice[];
  creditPurchases: CreditPurchase[];
  yearMonth: string;
}) {
  const monthStart = `${yearMonth}-01`;

  // 今月の新規ユーザー
  const newUsersThisMonth = profiles.filter(p =>
    p.created_at >= monthStart
  ).length;

  // 今月のサブスク売上（invoicesのcreatedをyearMonthでフィルタ）
  const subRevenueThisMonth = invoices
    .filter(inv => {
      const d = new Date(inv.created * 1000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === yearMonth
        && inv.status === "paid";
    })
    .reduce((s, inv) => s + inv.amount_paid, 0);

  // 今月のOP購入
  const opThisMonth = creditPurchases.filter(cp => cp.created_at >= monthStart);
  const opCountThisMonth   = opThisMonth.length;
  const opRevenueThisMonth = opThisMonth.reduce((s, cp) => s + cp.amount_yen, 0);

  const totalRevenueThisMonth = subRevenueThisMonth + opRevenueThisMonth;

  // プラン別人数
  const planCounts = Object.fromEntries(
    Object.keys(PLAN_CONFIG).map(k => [k, profiles.filter(p => p.plan === k).length])
  );

  // 紹介コード別
  const referralMap: Record<string, { count: number; revenue: number }> = {};
  for (const p of profiles) {
    const code = p.referral_code;
    if (!code) continue;
    if (!referralMap[code]) referralMap[code] = { count: 0, revenue: 0 };
    referralMap[code].count++;
    referralMap[code].revenue += PLAN_PRICES[p.plan] ?? 0;
  }
  const referralEntries = Object.entries(referralMap).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-5">
      {/* 今月の数値 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "今月の新規ユーザー", value: `${newUsersThisMonth}名`,     color: "text-blue-600" },
          { label: "今月の月額売上",     value: `¥${subRevenueThisMonth.toLocaleString()}`, color: "text-green-600" },
          { label: "今月のOP購入数",     value: `${opCountThisMonth}件`,       color: "text-purple-600" },
          { label: "今月のOP売上",       value: `¥${opRevenueThisMonth.toLocaleString()}`,  color: "text-purple-600" },
          { label: "今月の総売上",       value: `¥${totalRevenueThisMonth.toLocaleString()}`, color: "text-gray-900" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* プラン別 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">プラン別人数・売上</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">プラン</th>
                <th className="text-right pb-2 font-medium">人数</th>
                <th className="text-right pb-2 font-medium">月額/人</th>
                <th className="text-right pb-2 font-medium">月額売上（概算）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(Object.entries(PLAN_CONFIG) as [PlanKey, typeof PLAN_CONFIG[PlanKey]][]).map(([key, cfg]) => {
                const count   = planCounts[key] ?? 0;
                const revenue = count * (PLAN_PRICES[key] ?? 0);
                return (
                  <tr key={key}>
                    <td className="py-2 font-medium text-gray-800">{cfg.label}</td>
                    <td className="py-2 text-right text-gray-600">{count}名</td>
                    <td className="py-2 text-right text-gray-400">
                      {cfg.price > 0 ? `¥${cfg.price.toLocaleString()}` : "無料"}
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      {revenue > 0 ? `¥${revenue.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 紹介コード別 */}
      {referralEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">紹介コード別</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">紹介コード</th>
                  <th className="text-right pb-2 font-medium">申込数</th>
                  <th className="text-right pb-2 font-medium">月額売上（概算）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {referralEntries.map(([code, data]) => (
                  <tr key={code}>
                    <td className="py-2 font-mono text-blue-700">{code}</td>
                    <td className="py-2 text-right text-gray-600">{data.count}名</td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      ¥{data.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ユーザータブ ─────────────────────────────────────────────

function UsersTab({ profiles, usageMap, expenseMap }: {
  profiles: AdminProfile[];
  usageMap: Record<string, number>;
  expenseMap: Record<string, number>;
}) {
  const [search, setSearch]   = useState("");
  const [planFilter, setPlan] = useState("");
  const [refFilter, setRef]   = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return profiles.filter(p => {
      if (planFilter && p.plan !== planFilter) return false;
      if (refFilter  && p.referral_code !== refFilter) return false;
      if (q && ![p.email, p.name ?? "", p.phone ?? ""].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [profiles, search, planFilter, refFilter]);

  const refCodes = [...new Set(profiles.map(p => p.referral_code).filter(Boolean))] as string[];

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="名前・メール・電話で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={planFilter}
          onChange={e => setPlan(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">全プラン</option>
          {(Object.entries(PLAN_CONFIG) as [PlanKey, typeof PLAN_CONFIG[PlanKey]][]).map(([k, cfg]) => (
            <option key={k} value={k}>{cfg.label}</option>
          ))}
        </select>
        {refCodes.length > 0 && (
          <select
            value={refFilter}
            onChange={e => setRef(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">全紹介コード</option>
            {refCodes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="text-xs text-gray-400 self-center">{filtered.length}件</span>
      </div>

      {/* ユーザーリスト */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 bg-gray-50">
                {["氏名", "メール", "電話", "プラン", "紹介コード", "今月使用", "追加残高", "登録日", "操作"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const planKey = (p.plan || "none") as PlanKey;
                const cfg     = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.none;
                const used    = usageMap[p.id] ?? 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                      {p.name ?? <span className="text-gray-300">未設定</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[160px] truncate">{p.email}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                      {p.phone ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        planKey === "none" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"
                      }`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-blue-700">
                      {p.referral_code ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                      {used}/{cfg.monthlyLimit}枚
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      {p.extra_credits > 0 ? (
                        <span className="text-blue-600 font-medium">+{p.extra_credits}</span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-3 py-2.5">
                      <AdminActions userId={p.id} currentPlan={planKey} currentExtra={p.extra_credits} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                    該当するユーザーが見つかりません
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

// ─── OP購入履歴タブ ──────────────────────────────────────────

function CreditsTab({ creditPurchases, profiles }: {
  creditPurchases: CreditPurchase[];
  profiles: AdminProfile[];
}) {
  const profileMap = useMemo(
    () => Object.fromEntries(profiles.map(p => [p.id, p])),
    [profiles]
  );

  const totalAmount  = creditPurchases.reduce((s, cp) => s + cp.amount_yen, 0);
  const totalCredits = creditPurchases.reduce((s, cp) => s + cp.credits, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">総購入件数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{creditPurchases.length}件</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">総購入枚数</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalCredits}枚</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">総売上</p>
          <p className="text-2xl font-bold text-green-600 mt-1">¥{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                {["購入日時", "氏名", "メール", "紹介コード", "購入枚数", "金額"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {creditPurchases.map(cp => {
                const p = profileMap[cp.user_id];
                return (
                  <tr key={cp.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                      {new Date(cp.created_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">
                      {p?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[160px] truncate">
                      {p?.email ?? cp.user_id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-blue-700">
                      {p?.referral_code ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-purple-700">+{cp.credits}枚</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-900">
                      ¥{cp.amount_yen.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {creditPurchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">購入履歴がありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
