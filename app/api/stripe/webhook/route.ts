import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "署名がありません" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook署名検証失敗:", err);
    return NextResponse.json({ error: "署名検証失敗" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      // 決済完了 → プランをアクティベート
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        await admin.from("profiles").update({
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq("id", userId);
        break;
      }

      // サブスク変更（プラン変更・支払い失敗など）
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (!profile) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = subscription.status === "active"
          ? getPlanFromPriceId(priceId)
          : "none";

        await admin.from("profiles").update({
          plan,
          stripe_subscription_id: subscription.id,
        }).eq("id", profile.id);
        break;
      }

      // 解約完了 → noneに戻す
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (!profile) break;

        await admin.from("profiles").update({
          plan: "none",
          stripe_subscription_id: null,
        }).eq("id", profile.id);
        break;
      }
    }
  } catch (err) {
    console.error("Webhookハンドラエラー:", err);
  }

  return NextResponse.json({ received: true });
}
