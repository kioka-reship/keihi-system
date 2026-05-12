import { createAdminClient } from "@/lib/supabase/admin";
import ReferralsClient from "./ReferralsClient";

export interface ReferralCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  user_count: number;
}

export default async function AdminReferralsPage() {
  const admin = createAdminClient();

  // 紹介コード一覧
  const { data: codes } = await admin
    .from("referral_codes")
    .select("id, code, name, description, created_at")
    .order("created_at", { ascending: false });

  // 各コードの利用者数（profiles.referred_by = referral_codes.name）
  const { data: profileCounts } = await admin
    .from("profiles")
    .select("referred_by");

  const countMap: Record<string, number> = {};
  for (const p of profileCounts ?? []) {
    if (p.referred_by) countMap[p.referred_by] = (countMap[p.referred_by] ?? 0) + 1;
  }

  const referralCodes: ReferralCode[] = (codes ?? []).map(c => ({
    ...c,
    user_count: countMap[c.name] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">紹介コード管理</h1>
        <p className="text-sm text-gray-500 mt-1">{referralCodes.length}件のコード</p>
      </div>
      <ReferralsClient referralCodes={referralCodes} />
    </div>
  );
}
