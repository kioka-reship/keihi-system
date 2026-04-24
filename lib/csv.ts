import { Expense, ACCOUNT_ITEMS } from "@/types";

export function generateCSV(expenses: Expense[]): string {
  const BOM = "﻿";

  const rows: string[] = [];
  rows.push("日付,店名,金額,勘定科目,品目・内容,メモ");

  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
  for (const e of sorted) {
    rows.push(
      [
        e.date,
        `"${e.storeName.replace(/"/g, '""')}"`,
        e.amount,
        e.accountItem,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.memo.replace(/"/g, '""')}"`,
      ].join(",")
    );
  }

  rows.push("");
  rows.push("【勘定科目別合計】");
  rows.push("勘定科目,合計金額");

  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.accountItem, (totals.get(e.accountItem) ?? 0) + e.amount);
  }

  let grandTotal = 0;
  for (const account of ACCOUNT_ITEMS) {
    const total = totals.get(account);
    if (total !== undefined) {
      rows.push(`${account},${total}`);
      grandTotal += total;
    }
  }

  rows.push(`合計,${grandTotal}`);

  return BOM + rows.join("\r\n");
}

export function downloadCSV(expenses: Expense[], filename: string): void {
  const csv = generateCSV(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
