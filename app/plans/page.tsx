import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import PlanButton from "./PlanButton";
import CancelButton from "./CancelButton";

const PLAN_FEATURES: Record<string, string[]> = {
  light:    ["月20枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存"],
  standard: ["月40枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存"],
  pro:      ["月120枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存", "優先サポート"],
};

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, stripe_subscription_id, monthly_count")
    .eq("id", user.id)
    .single();

  const currentPlan = ((profile?.plan) || "none") as PlanKey;
  const hasSubscription = !!profile?.stripe_subscription_id;
  const currentConfig = PLAN_CONFIG[currentPlan] ?? PLAN_CONFIG.none;

  const plans: { key: PlanKey; popular?: boolean }[] = [
    { key: "light" },
    { key: "standard", popular: true },
    { key: "pro" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">プラン管理</h1>

      {/* 現在のプラン */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-400 font-medium mb-1">現在のプラン</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{currentConfig.label}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              月{currentConfig.monthlyLimit}枚まで解析
              {currentConfig.price > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ¥{currentConfig.price.toLocaleString()}/月
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">今月の使用枚数</p>
            <p className="text-xl font-bold text-gray-900">
              {profile?.monthly_count ?? 0}
              <span className="text-sm font-normal text-gray-400">/{currentConfig.monthlyLimit}枚</span>
            </p>
          </div>
        </div>

        {hasSubscription && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">サブスクリプション有効中</p>
            <CancelButton />
          </div>
        )}

        {currentPlan === "none" && (
          <div className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl p-3">
            お試しプランは月3枚まで解析できます。下記からプランを選択してください。
          </div>
        )}
      </div>

      {/* プラン選択 */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {hasSubscription ? "プランを変更する" : "プランを選択する"}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map(({ key, popular }) => {
            const config = PLAN_CONFIG[key];
            const isCurrent = currentPlan === key;
            const features = PLAN_FEATURES[key] ?? [];

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl border-2 p-5 relative flex flex-col ${
                  popular ? "border-blue-500 shadow-md" : "border-gray-200"
                } ${isCurrent ? "ring-2 ring-green-300" : ""}`}
              >
                {popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    人気プラン
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    現在のプラン
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-bold text-gray-800 text-lg">{config.label}</p>
                  <p className="mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ¥{config.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/月</span>
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    月{config.monthlyLimit}枚まで解析
                  </p>
                </div>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {features.map((f) => (
                    <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <PlanButton
                  planKey={key}
                  isCurrent={isCurrent}
                  hasSubscription={hasSubscription}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center text-gray-400">
        クレジットカード決済対応 · いつでも解約可能 · Stripeによる安全な決済
      </p>
    </div>
  );
}
