"use client";

import { useState } from "react";
import { AccountItem, ACCOUNT_ITEMS, Expense } from "@/types";

interface Props {
  expense: Expense;
  onSave: (updated: Expense) => void;
  onClose: () => void;
}

export default function EditModal({ expense, onSave, onClose }: Props) {
  const [values, setValues] = useState({
    date: expense.date,
    storeName: expense.storeName,
    amount: String(expense.amount),
    accountItem: expense.accountItem,
    description: expense.description,
    memo: expense.memo,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...expense,
      date: values.date,
      storeName: values.storeName,
      amount: Number(values.amount),
      accountItem: values.accountItem as AccountItem,
      description: values.description,
      memo: values.memo,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">経費を編集</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">日付</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={values.date}
                onChange={(e) => setValues({ ...values, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">金額（円）</label>
              <input
                type="number"
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={values.amount}
                onChange={(e) => setValues({ ...values, amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">店名</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={values.storeName}
              onChange={(e) => setValues({ ...values, storeName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">勘定科目</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              value={values.accountItem}
              onChange={(e) => setValues({ ...values, accountItem: e.target.value as AccountItem })}
            >
              {ACCOUNT_ITEMS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">品目・内容</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={values.memo}
              onChange={(e) => setValues({ ...values, memo: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
