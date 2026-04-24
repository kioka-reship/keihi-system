export const ACCOUNT_ITEMS = [
  "売上高",
  "仕入金額（製品製造原価）",
  "租税公課",
  "荷造運賃",
  "水道光熱費",
  "旅費交通費",
  "通信費",
  "広告宣伝費",
  "接待交際費",
  "損害保険料",
  "修繕費",
  "消耗品費",
  "減価償却費",
  "福利厚生費",
  "給料賃金",
  "外注工費",
  "利子割引料",
  "地代家賃",
  "貸倒費",
  "雑費",
] as const;

export type AccountItem = (typeof ACCOUNT_ITEMS)[number];

export interface Expense {
  id: string;
  date: string;
  storeName: string;
  amount: number;
  accountItem: AccountItem;
  description: string;
  memo: string;
  imageBase64?: string;
  createdAt: string;
}

export interface ReceiptAnalysis {
  date: string;
  storeName: string;
  amount: number;
  description: string;
  suggestedAccounts: AccountItem[];
}
