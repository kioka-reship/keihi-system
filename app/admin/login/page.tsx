import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  // 既にログイン済みの管理者は /admin へリダイレクト
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

  return <AdminLoginForm />;
}
