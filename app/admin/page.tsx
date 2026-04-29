import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { PLAN_CONFIG } from "@/lib/plans";
import AdminClient, { type AdminProfile, type CreditPurchase, type StripeInvoice } from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!myProfile?.is_admin) redirect("/");

  const admin = createAdminClient();

  // 全ユーザープロフィール
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, name, phone, address, referral_code, plan, monthly_count, extra_credits, is_admin, created_at, stripe_customer_id")
    .order("created_at", { ascending: false });

  // 今月の解析ログ
  const yearMonth = new Date().toISOString().slice(0, 7);
  const { data: usageLogs } = await admin
    .from("usage_logs")
    .select("user_id")
    .eq("year_month", yearMonth);

  const usageMap: Record<string, number> = {};
  for (const log of usageLogs ?? []) {
    usageMap[log.user_id] = (usageMap[log.user_id] ?? 0) + 1;
  }

  // 経費件数
  const { data: expenseCounts } = await admin
    .from("expenses")
    .select("user_id");

  const expenseMap: Record<string, number> = {};
  for (const e of expenseCounts ?? []) {
    expenseMap[e.user_id] = (expenseMap[e.user_id] ?? 0) + 1;
  }

  // Stripe 請求履歴（最大50件）
  const invoicesRes = await stripe.invoices.list({ limit: 50 });
  const invoices: StripeInvoice[] = invoicesRes.data.map(inv => {
    const rawPrice = inv.lines.data[0]?.pricing?.price_details?.price;
    const priceId  = typeof rawPrice === "string" ? rawPrice : (rawPrice?.id ?? "");
    const planKey  = getPlanFromPriceId(priceId);
    return {
      id:             inv.id,
      customer_email: inv.customer_email,
      amount_paid:    inv.amount_paid,
      status:         inv.status,
      created:        inv.created,
      plan_label:     planKey !== "none" ? PLAN_CONFIG[planKey].label : "—",
    };
  });

  // OP購入履歴（全件・新しい順）
  let creditPurchases: CreditPurchase[] = [];
  try {
    const { data } = await admin
      .from("credit_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    creditPurchases = data ?? [];
  } catch {
    // credit_purchases テーブル未作成の場合は空配列
  }

  return (
    <AdminClient
      profiles={(profiles ?? []) as AdminProfile[]}
      usageMap={usageMap}
      expenseMap={expenseMap}
      invoices={invoices}
      creditPurchases={creditPurchases}
      yearMonth={yearMonth}
    />
  );
}
