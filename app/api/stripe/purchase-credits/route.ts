import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

const CREDIT_PACKAGES: Record<string, { credits: number }> = {
  "price_1TRCPrARAfw3QBpCzJQYUJyp": { credits: 20  },
  "price_1TRCQIARAfw3QBpC2fYEKnpI": { credits: 50  },
  "price_1TRCQcARAfw3QBpCXfINlw0P": { credits: 100 },
  "price_1TRCQtARAfw3QBpCAHjrhIkF": { credits: 300 },
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  try {
    const { priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: "priceId は必須です" }, { status: 400 });

    const pkg = CREDIT_PACKAGES[priceId];
    if (!pkg) return NextResponse.json({ error: "無効な Price ID です" }, { status: 400 });

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://keihi-system-gamma.vercel.app";

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/credits`,
      metadata: {
        userId: user.id,
        credits: String(pkg.credits),
        priceId,
      },
      locale: "ja",
    };

    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email ?? undefined;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("purchase-credits error:", error);
    return NextResponse.json({ error: "決済セッションの作成に失敗しました" }, { status: 500 });
  }
}
