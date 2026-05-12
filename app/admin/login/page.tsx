import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  // admin_verified クッキーがある場合のみ /admin へリダイレクト
  // クッキーなしで /admin にリダイレクトすると (protected)/layout.tsx が
  // 再び /admin/login に戻す無限ループが発生するため、必ずクッキーを確認する
  const cookieStore = await cookies();
  if (cookieStore.get("admin_verified")?.value) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (profile?.is_admin) redirect("/admin");
    }
  }

  return <AdminLoginForm />;
}
