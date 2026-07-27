import { useEffect, useState, useCallback } from "react";

export type Sale = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  item: string;
  quantity: number;
  price: number; // unit price
  total: number;
  notes?: string;
  createdAt: number;
};

export type ExpenseCategory =
  | "Stock"
  | "Rent"
  | "Electricity"
  | "Water"
  | "Transport"
  | "Salary"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Stock",
  "Rent",
  "Electricity",
  "Water",
  "Transport",
  "Salary",
  "Other",
];

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  notes?: string;
  createdAt: number;
};

const SALES_KEY = "shoptrack.sales.v1";
const EXPENSES_KEY = "shoptrack.expenses.v1";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("shoptrack:update", { detail: { key } }));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 10);
}

function useLocalCollection<T>(key: string) {
  const [items, setItems] = useState<T[]>(() => read<T>(key));

  useEffect(() => {
    const sync = () => setItems(read<T>(key));
    window.addEventListener("shoptrack:update", sync as EventListener);
    window.addEventListener("storage", sync);
    // ensure hydration
    sync();
    return () => {
      window.removeEventListener("shoptrack:update", sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  const add = useCallback(
    (item: T) => {
      const current = read<T>(key);
      write(key, [item, ...current]);
    },
    [key],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      const current = read<T & { id: string }>(key);
      write(
        key,
        current.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const current = read<T & { id: string }>(key);
      write(
        key,
        current.filter((it) => it.id !== id),
      );
    },
    [key],
  );

  return { items, add, update, remove };
}

export const useSales = () => useLocalCollection<Sale>(SALES_KEY);
export const useExpenses = () => useLocalCollection<Expense>(EXPENSES_KEY);

export function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function inRange(dateISO: string, from?: string, to?: string) {
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}

export function startOfWeekISO(base = new Date()) {
  const d = new Date(base);
  const day = d.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // week starts Monday
  d.setDate(d.getDate() - diff);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function startOfMonthISO(base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth(), 1);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}
