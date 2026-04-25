import { Expense } from "@/types";

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const res = await fetch("/api/expenses");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function addExpense(expense: Omit<Expense, "id" | "userId" | "createdAt">): Promise<Expense | null> {
  try {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateExpense(updated: Expense): Promise<void> {
  await fetch(`/api/expenses/${updated.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  await fetch(`/api/expenses/${id}`, { method: "DELETE" });
}
