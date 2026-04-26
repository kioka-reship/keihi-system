export const PLAN_CONFIG = {
  none:     { label: "お試し（3枚）",  monthlyLimit: 3,   price: 0,    stripePriceId: null },
  light:    { label: "ライト",         monthlyLimit: 20,  price: 980,  stripePriceId: "price_1TPvnLAYo0SBr2K876ryFMIc" },
  standard: { label: "スタンダード",   monthlyLimit: 40,  price: 1680, stripePriceId: "price_1TPvnbAYo0SBr2K85YkEVnDm" },
  pro:      { label: "PRO",           monthlyLimit: 120, price: 2980, stripePriceId: "price_1TPvnqAYo0SBr2K810KSO4Mu" },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

export const EXTRA_PACKS = [
  { id: "extra_20", count: 20, price: 300, label: "追加20枚 ¥300" },
  { id: "extra_50", count: 50, price: 700, label: "追加50枚 ¥700" },
] as const;

export const ONE_TIME_PACKS = [
  { id: "tax_pack",     count: 300, price: 3980, label: "確定申告パック（300枚）¥3,980" },
  { id: "premium_pack", count: 999, price: 6980, label: "プレミアム申告パック ¥6,980〜" },
] as const;
