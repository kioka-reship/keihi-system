import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const NAV_ITEMS = [
  { href: "/admin",           label: "📊 ダッシュボード" },
  { href: "/admin/users",     label: "👥 ユーザー管理" },
  { href: "/admin/stats",     label: "💰 売上・統計" },
  { href: "/admin/referrals", label: "🎟️ 紹介コード管理" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers();
  const pathname = reqHeaders.get("x-pathname") ?? "";

  // /admin/login はサイドバー・認証チェック不要
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="w-52 bg-gray-900 text-white flex flex-col fixed h-full z-50 shrink-0">
        <div className="p-5 border-b border-gray-800">
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Admin</p>
          <p className="font-bold text-white mt-0.5">📒 keihi</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            ← アプリに戻る
          </Link>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 ml-52 min-h-screen">
        <div className="p-8 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
}
