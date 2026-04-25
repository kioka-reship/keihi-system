import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

interface Profile {
  plan: string;
  extra_credits: number;
}

/**
 * プロフィールを取得し、存在しない場合はadminクライアントで自動作成する。
 * auth.usersトリガーが失敗した場合の自己修復。
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string
): Promise<Profile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("plan, extra_credits")
    .eq("id", userId)
    .single();

  if (existing) return existing;

  // トリガーが失敗していた場合：service_roleで強制作成
  const admin = createAdminClient();
  const { data: created } = await admin
    .from("profiles")
    .upsert(
      { id: userId, email: userEmail, plan: "none", extra_credits: 0 },
      { onConflict: "id" }
    )
    .select("plan, extra_credits")
    .single();

  return created ?? { plan: "none", extra_credits: 0 };
}
