import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import PlanButton from "./PlanButton";

const PLAN_FEATURES: Record<string, string[]> = {
  light:    ["月20枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存"],
  standard: ["月40枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存"],
  pro:      ["月120枚まで解析", "全勘定科目対応", "CSV出力", "データ永続保存", "優先サポート"],
};

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const currentPlan = ((profile?.plan) || "none") as PlanKey;
  const hasSubscription = !!profile?.stripe_subscription_id;

  const plans: { key: PlanKey; popular?: boolean }[] = [
    { key: "light" },
    { key: "standard", popular: true },
    { key: "pro" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">プランを選択</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          現在：<span className="font-semibold text-blue-600">{PLAN_CONFIG[currentPlan].label}</span>
        </p>
      </div>

      {currentPlan === "none" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          お試しプランは月3枚まで解析できます。プランを選択してさらにご利用ください。
        </div>
      )}

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
              } ${isCurrent ? "ring-2 ring-blue-300" : ""}`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  人気プラン
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
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

      <p className="text-xs text-center text-gray-400">
        クレジットカード決済対応 · いつでも解約可能 · Stripeによる安全な決済
      </p>
    </div>
  );
}
