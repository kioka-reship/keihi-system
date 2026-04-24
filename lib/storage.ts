import { Expense } from "@/types";

const STORAGE_KEY = "keihi_expenses";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Expense): void {
  const expenses = loadExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
}

export function updateExpense(updated: Expense): void {
  const expenses = loadExpenses();
  const index = expenses.findIndex((e) => e.id === updated.id);
  if (index !== -1) {
    expenses[index] = updated;
    saveExpenses(expenses);
  }
}

export function deleteExpense(id: string): void {
  const expenses = loadExpenses();
  saveExpenses(expenses.filter((e) => e.id !== id));
}
