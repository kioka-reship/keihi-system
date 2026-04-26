import Stripe from "stripe";
import { PLAN_CONFIG, PlanKey } from "@/lib/plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export function getPlanFromPriceId(priceId: string): PlanKey {
  const entry = Object.entries(PLAN_CONFIG).find(
    ([, config]) => config.stripePriceId === priceId
  );
  return (entry?.[0] as PlanKey) ?? "none";
}

export function getPriceIdFromPlan(planKey: string): string | null {
  return PLAN_CONFIG[planKey as PlanKey]?.stripePriceId ?? null;
}
