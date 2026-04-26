import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID → PlanKey のマッピング（サーバーサイドのみ使用）
export function getPlanFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_LIGHT!]:    "light",
    [process.env.STRIPE_PRICE_STANDARD!]: "standard",
    [process.env.STRIPE_PRICE_PRO!]:      "pro",
  };
  return map[priceId] ?? "none";
}

export function getPriceIdFromPlan(planKey: string): string | null {
  const map: Record<string, string> = {
    light:    process.env.STRIPE_PRICE_LIGHT!,
    standard: process.env.STRIPE_PRICE_STANDARD!,
    pro:      process.env.STRIPE_PRICE_PRO!,
  };
  return map[planKey] ?? null;
}
