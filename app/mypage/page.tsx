import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import Stripe from "stripe";

const PLAN_LIMITS: Record<string, number> = {
  none: 3, free: 3, light: 20, standard: 40, pro: 120,
};
const PLAN_NAMES: Record<string, string> = {
  none: "お試し", free: "お試し", light: "ライト", standard: "スタンダード", pro: "PRO",
};
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  paid:          { label: "支払済",   color: "text-green-600 bg-green-50" },
  open:          { label: "未払い",   color: "text-yellow-700 bg-yellow-50" },
  void:          { label: "無効",     color: "text-gray-500 bg-gray-100" },
  uncollectible: { label: "回収不能", color: "text-red-600 bg-red-50" },
  draft:         { label: "下書き",   color: "text-gray-500 bg-gray-100" },
};

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, monthly_count, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan || "none") as string;
  const planKey = (plan === "free" ? "none" : plan) as PlanKey;
  const planConfig = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.none;
  const limit = PLAN_LIMITS[plan] ?? 3;
  const used = profile?.monthly_count ?? 0;
  const remaining = Math.max(0, limit - used);
  const usagePercent = Math.min(100, Math.round((used / limit) * 100));
  const isPaid = plan !== "none" && plan !== "free";

  // Stripe請求履歴（customer_idがある場合のみ）
  let invoices: Stripe.Invoice[] = [];
  if (profile?.stripe_customer_id) {
    const res = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 5,
    });
    invoices = res.data;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">マイページ</h1>
        <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
      </div>

      {/* プランカード */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">現在のプラン</p>
            <p className="text-xl font-bold text-gray-900">{PLAN_NAMES[plan]}</p>
            {isPaid && (
              <p className="text-sm text-blue-600 font-medium mt-0.5">
                ¥{planConfig.price.toLocaleString()}/月
              </p>
            )}
          </div>
          <Link
            href="/plans"
            className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            {isPaid ? "プラン管理" : "アップグレード"}
          </Link>
        </div>

        {/* 使用状況 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">今月の使用枚数</span>
            <span className="font-semibold text-gray-900">
              {used}
              <span className="text-gray-400 font-normal">/{limit}枚</span>
            </span>
          </div>
          {/* プログレスバー */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent >= 100 ? "bg-red-500" : usagePercent >= 80 ? "bg-orange-400" : "bg-blue-500"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>残り{remaining}枚</span>
            <span>{usagePercent}% 使用</span>
          </div>
        </div>

        {remaining === 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
            今月の上限に達しました。
            <Link href="/plans" className="underline font-medium ml-1">
              プランをアップグレード
            </Link>
            して続けてご利用ください。
          </div>
        )}
      </div>

      {/* アカウント情報 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">アカウント情報</p>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">メールアドレス</span>
            <span className="font-medium truncate max-w-[220px]">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">プラン</span>
            <span className="font-medium">{PLAN_NAMES[plan]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">月間上限</span>
            <span className="font-medium">{limit}枚</span>
          </div>
        </div>
      </div>

      {/* 請求履歴 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">直近の請求履歴</p>
          {invoices.length > 0 && (
            <span className="text-xs text-gray-400">直近{invoices.length}件</span>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            {isPaid ? "請求履歴がありません" : "有料プランへアップグレードすると請求履歴が表示されます"}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {invoices.map((invoice) => {
              const status = STATUS_MAP[invoice.status ?? ""] ?? { label: invoice.status ?? "—", color: "text-gray-500 bg-gray-100" };
              const date = new Date(invoice.created * 1000).toLocaleDateString("ja-JP", {
                year: "numeric", month: "long", day: "numeric",
              });
              const amount = invoice.amount_paid.toLocaleString();

              return (
                <div key={invoice.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 font-medium">{date}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {invoice.lines.data[0]?.description ?? "サブスクリプション"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-semibold text-gray-900">¥{amount}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
