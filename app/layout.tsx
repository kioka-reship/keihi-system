import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "経費帳簿 | 白色申告",
  description: "白色申告用経費管理システム",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let usageInfo = null;
  if (user) {
    const yearMonth = new Date().toISOString().slice(0, 7);
    const [{ data: profile }, { count }] = await Promise.all([
      supabase.from("profiles").select("plan, extra_credits").eq("id", user.id).single(),
      supabase.from("usage_logs").select("*", { count: "exact", head: true })
        .eq("user_id", user.id).eq("year_month", yearMonth),
    ]);
    if (profile) {
      const planKey = (profile.plan || "none") as PlanKey;
      const config = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.none;
      usageInfo = {
        used: count ?? 0,
        limit: config.monthlyLimit,
        extra: profile.extra_credits ?? 0,
        planLabel: config.label,
      };
    }
  }

  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen antialiased">
        {user && (
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-bold text-blue-700 text-lg">📒 経費帳簿</Link>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <Link href="/" className="text-gray-600 hover:text-blue-600">ホーム</Link>
                  <Link href="/register" className="text-gray-600 hover:text-blue-600">登録</Link>
                  <Link href="/list" className="text-gray-600 hover:text-blue-600">一覧</Link>
                </div>
                {usageInfo && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                    {usageInfo.planLabel}｜
                    <span className={usageInfo.used >= usageInfo.limit ? "text-red-500 font-semibold" : "text-gray-700"}>
                      {usageInfo.used}/{usageInfo.limit}枚
                    </span>
                    {usageInfo.extra > 0 && <span className="text-blue-600"> +{usageInfo.extra}</span>}
                  </div>
                )}
                <LogoutButton />
              </div>
            </div>
            {/* スマホ用ボトムナビ */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
              {[
                { href: "/", label: "ホーム", icon: "🏠" },
                { href: "/register", label: "登録", icon: "➕" },
                { href: "/list", label: "一覧", icon: "📋" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-blue-600 text-xs gap-0.5">
                  <span className="text-lg leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
        <main className="max-w-2xl mx-auto px-4 py-6 pb-20 sm:pb-6">{children}</main>
      </body>
    </html>
  );
}
