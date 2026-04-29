import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import "./globals.css";
import LogoutButton from "@/components/LogoutButton";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "keihi | レシート読み取りで経費管理を自動化",
  description: "AIがレシートを自動解析。白色申告に対応した経費帳簿SaaS。スマホで撮るだけで経費入力が完了します。",
  openGraph: {
    title: "keihi | レシート読み取りで経費管理を自動化",
    description: "AIがレシートを自動解析。白色申告に対応した経費帳簿SaaS。",
    url: "https://keihi-system-gamma.vercel.app",
    siteName: "keihi",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "keihi | レシート読み取りで経費管理を自動化",
    description: "AIがレシートを自動解析。白色申告に対応した経費帳簿SaaS。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const PLAN_LIMITS: Record<string, number> = {
  none:     3,
  free:     3,
  light:    20,
  standard: 40,
  pro:      120,
};

const PLAN_NAMES: Record<string, string> = {
  none:     "お試し",
  free:     "お試し",
  light:    "ライト",
  standard: "スタンダード",
  pro:      "PRO",
};

async function getNavData() {
  // 環境変数未設定やSupabase障害時にレイアウト自体がクラッシュしないよう守る
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return null;
    }

    // cookieクライアントでユーザー認証のみ行う
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // adminクライアントでprofilesを取得（RLSをバイパス）
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("plan, monthly_count, extra_credits")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[getNavData] profiles query error:", profileError.code, profileError.message);
    }

    // extra_credits カラム未追加などでクエリ失敗した場合のフォールバック
    type NavProfile = { plan: string | null; monthly_count: number | null; extra_credits?: number };
    let resolved: NavProfile | null = profile as NavProfile | null;
    if (!profile) {
      const { data: fallback, error: fallbackError } = await admin
        .from("profiles")
        .select("plan, monthly_count")
        .eq("id", user.id)
        .single();
      if (fallbackError) {
        console.error("[getNavData] fallback query error:", fallbackError.message);
      }
      resolved = fallback as NavProfile | null;
    }

    if (!resolved) return null;

    const plan = (resolved.plan || "none") as string;
    const limit = PLAN_LIMITS[plan] ?? 3;
    const used = resolved.monthly_count ?? 0;
    const remaining = Math.max(0, limit - used);

    return {
      planName: PLAN_NAMES[plan] ?? "お試し",
      limit,
      remaining,
      extra: resolved.extra_credits ?? 0,
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavData();
  const reqHeaders = await headers();
  const pathname = reqHeaders.get("x-pathname") ?? "";
  const isLP = pathname === "/lp";

  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen antialiased">
        {!isLP && nav && (
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-bold text-blue-700 text-lg">📒 経費帳簿</Link>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <Link href="/" className="text-gray-600 hover:text-blue-600">ホーム</Link>
                  <Link href="/register" className="text-gray-600 hover:text-blue-600">登録</Link>
                  <Link href="/list" className="text-gray-600 hover:text-blue-600">一覧</Link>
                  <Link href="/report" className="text-gray-600 hover:text-blue-600">レポート</Link>
                  <Link href="/plans" className="text-gray-600 hover:text-blue-600">プラン</Link>
                  <Link href="/credits" className="text-gray-600 hover:text-blue-600">追加購入</Link>
                  <Link href="/mypage" className="text-gray-600 hover:text-blue-600">マイページ</Link>
                </div>
                <Link href="/credits" className="text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  {nav.planName}（{nav.limit}枚）｜
                  <span className={nav.remaining === 0 ? "text-red-500 font-semibold" : "text-gray-700"}>
                    残り{nav.remaining}枚
                  </span>
                  {nav.extra > 0 && <span className="text-blue-600"> +{nav.extra}</span>}
                </Link>
                <LogoutButton />
              </div>
            </div>
            {/* スマホ用ボトムナビ */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
              {[
                { href: "/",        label: "ホーム",   icon: "🏠" },
                { href: "/register", label: "登録",   icon: "➕" },
                { href: "/list",    label: "一覧",    icon: "📋" },
                { href: "/report",  label: "レポート", icon: "📊" },
                { href: "/plans",   label: "プラン",  icon: "💳" },
                { href: "/mypage",  label: "マイページ", icon: "👤" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-blue-600 text-xs gap-0.5">
                  <span className="text-lg leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </header>
        )}
        {isLP ? (
          children
        ) : (
          <main className="max-w-2xl mx-auto px-4 py-6 pb-20 sm:pb-6">{children}</main>
        )}

        {/* フッター（LP以外） */}
        {!isLP && (
          <footer className="border-t border-gray-200 bg-white mt-8 pb-20 sm:pb-0">
            <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <p>© 2026 keihi. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/faq"     className="hover:text-gray-600 transition-colors">よくある質問</Link>
                <Link href="/contact" className="hover:text-gray-600 transition-colors">お問い合わせ</Link>
                <Link href="/privacy" className="hover:text-gray-600 transition-colors">プライバシーポリシー</Link>
                <Link href="/terms"   className="hover:text-gray-600 transition-colors">利用規約</Link>
              </div>
            </div>
          </footer>
        )}

        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
