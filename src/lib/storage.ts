import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Sale = {
  id: string;
  date: string;
  item: string;
  quantity: number;
  price: number;
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

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 10);
}

type SaleRow = {
  id: string;
  date: string;
  item: string;
  quantity: number | string;
  price: number | string;
  total: number | string;
  notes: string | null;
  created_at: string;
};

type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  amount: number | string;
  notes: string | null;
  created_at: string;
};

const mapSale = (r: SaleRow): Sale => ({
  id: r.id,
  date: r.date,
  item: r.item,
  quantity: Number(r.quantity),
  price: Number(r.price),
  total: Number(r.total),
  notes: r.notes ?? undefined,
  createdAt: new Date(r.created_at).getTime(),
});

const mapExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  date: r.date,
  category: r.category as ExpenseCategory,
  amount: Number(r.amount),
  notes: r.notes ?? undefined,
  createdAt: new Date(r.created_at).getTime(),
});

export function useSales() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales" as never)
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as SaleRow[]).map(mapSale);
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sales"] });

  const addMut = useMutation({
    mutationFn: async (s: Sale) => {
      const { error } = await supabase.from("sales" as never).insert({
        date: s.date,
        item: s.item,
        quantity: s.quantity,
        price: s.price,
        total: s.total,
        notes: s.notes ?? null,
      } as never);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Sale> }) => {
      const { error } = await supabase
        .from("sales" as never)
        .update({
          ...(patch.date !== undefined && { date: patch.date }),
          ...(patch.item !== undefined && { item: patch.item }),
          ...(patch.quantity !== undefined && { quantity: patch.quantity }),
          ...(patch.price !== undefined && { price: patch.price }),
          ...(patch.total !== undefined && { total: patch.total }),
          ...(patch.notes !== undefined && { notes: patch.notes ?? null }),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const add = useCallback((s: Sale) => addMut.mutate(s), [addMut]);
  const update = useCallback(
    (id: string, patch: Partial<Sale>) => updateMut.mutate({ id, patch }),
    [updateMut],
  );
  const remove = useCallback((id: string) => removeMut.mutate(id), [removeMut]);

  return { items, add, update, remove };
}

export function useExpenses() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses" as never)
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as ExpenseRow[]).map(mapExpense);
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["expenses"] });

  const addMut = useMutation({
    mutationFn: async (e: Expense) => {
      const { error } = await supabase.from("expenses" as never).insert({
        date: e.date,
        category: e.category,
        amount: e.amount,
        notes: e.notes ?? null,
      } as never);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Expense> }) => {
      const { error } = await supabase
        .from("expenses" as never)
        .update({
          ...(patch.date !== undefined && { date: patch.date }),
          ...(patch.category !== undefined && { category: patch.category }),
          ...(patch.amount !== undefined && { amount: patch.amount }),
          ...(patch.notes !== undefined && { notes: patch.notes ?? null }),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const add = useCallback((e: Expense) => addMut.mutate(e), [addMut]);
  const update = useCallback(
    (id: string, patch: Partial<Expense>) => updateMut.mutate({ id, patch }),
    [updateMut],
  );
  const remove = useCallback((id: string) => removeMut.mutate(id), [removeMut]);

  return { items, add, update, remove };
}

export function formatMoney(n: number) {
  const value = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n || 0);
  return `Rs ${value}`;
}

export function inRange(dateISO: string, from?: string, to?: string) {
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}

export function startOfWeekISO(base = new Date()) {
  const d = new Date(base);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function startOfMonthISO(base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth(), 1);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}
