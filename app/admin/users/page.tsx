import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  name: string | null;
  phone: string | null;
  plan: string;
  created_at: string;
  referred_by: string | null;
  monthly_count: number;
  extra_credits: number;
  is_admin: boolean;
  stripe_customer_id: string | null;
}

export interface ReferralCodeRow {
  id: string;
  code: string;
  name: string;
}

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, email, full_name, name, phone, plan, created_at, referred_by, monthly_count, extra_credits, is_admin, stripe_customer_id")
    .order("created_at", { ascending: false });

  let referralCodes: ReferralCodeRow[] = [];
  try {
    const { data } = await admin
      .from("referral_codes")
      .select("id, code, name")
      .order("name");
    referralCodes = data ?? [];
  } catch { /* テーブル未作成時は空 */ }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="text-sm text-gray-500 mt-1">全 {(users ?? []).length}名</p>
      </div>
      <UsersClient users={(users ?? []) as UserRow[]} referralCodes={referralCodes} />
    </div>
  );
}
