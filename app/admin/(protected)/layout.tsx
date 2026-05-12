import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminExitButton from "../AdminExitButton";

const NAV_ITEMS = [
  { href: "/admin",           label: "📊 ダッシュボード" },
  { href: "/admin/users",     label: "👥 ユーザー管理" },
  { href: "/admin/stats",     label: "💰 売上・統計" },
  { href: "/admin/referrals", label: "🎟️ 紹介コード管理" },
] as const;

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  // admin_verified クッキー確認
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_verified")?.value) redirect("/admin/login");

  // is_admin 確認
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
          <AdminExitButton />
        </div>
      </aside>
      <div className="flex-1 ml-52 min-h-screen">
        <div className="p-8 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
}
