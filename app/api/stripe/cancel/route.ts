import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "有効なサブスクリプションが見つかりません" }, { status: 400 });
  }

  await stripe.subscriptions.cancel(profile.stripe_subscription_id);

  await admin
    .from("profiles")
    .update({ plan: "none", stripe_subscription_id: null })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
