import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import AdminActions from "./AdminActions";

export default async function AdminPage() {
  // 認証 + 管理者チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!myProfile?.is_admin) redirect("/");

  // 全ユーザー取得（service_role）
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // 今月の使用枚数を全ユーザー分取得
  const yearMonth = new Date().toISOString().slice(0, 7);
  const { data: usageLogs } = await admin
    .from("usage_logs")
    .select("user_id")
    .eq("year_month", yearMonth);

  const usageMap: Record<string, number> = {};
  for (const log of usageLogs || []) {
    usageMap[log.user_id] = (usageMap[log.user_id] ?? 0) + 1;
  }

  // 総経費件数を全ユーザー分取得
  const { data: expenseCounts } = await admin
    .from("expenses")
    .select("user_id");

  const expenseMap: Record<string, number> = {};
  for (const e of expenseCounts || []) {
    expenseMap[e.user_id] = (expenseMap[e.user_id] ?? 0) + 1;
  }

  const totalUsers = profiles?.length ?? 0;
  const totalUsageThisMonth = Object.values(usageMap).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">管理者画面</h1>
        <p className="text-sm text-gray-500 mt-0.5">{yearMonth} · ユーザー {totalUsers}名 · 今月の解析 {totalUsageThisMonth}件</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(PLAN_CONFIG) as [PlanKey, typeof PLAN_CONFIG[PlanKey]][]).map(([key, config]) => {
          const count = profiles?.filter((p) => p.plan === key).length ?? 0;
          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">{config.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              <p className="text-xs text-gray-400">ユーザー</p>
            </div>
          );
        })}
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">ユーザー一覧</p>
        </div>
        <div className="divide-y divide-gray-100">
          {(profiles || []).map((profile) => {
            const planKey = (profile.plan || "none") as PlanKey;
            const planConfig = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.none;
            const used = usageMap[profile.id] ?? 0;
            const expenses = expenseMap[profile.id] ?? 0;

            return (
              <div key={profile.id} className="px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{profile.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      登録: {new Date(profile.created_at).toLocaleDateString("ja-JP")}
                      {" · "}経費 {expenses}件
                      {" · "}今月 {used}/{planConfig.monthlyLimit}枚
                      {profile.extra_credits > 0 && ` · 追加残高 ${profile.extra_credits}枚`}
                    </p>
                  </div>
                  <AdminActions
                    userId={profile.id}
                    currentPlan={planKey}
                    currentExtra={profile.extra_credits}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
