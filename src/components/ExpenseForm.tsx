import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseCategory,
  todayISO,
  uid,
} from "@/lib/storage";

type Props = {
  initial?: Expense;
  onSubmit: (e: Expense) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function ExpenseForm({ initial, onSubmit, onCancel, submitLabel = "Save Expense" }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? "Stock");
  const [amount, setAmount] = useState<string>(String(initial?.amount ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount) || 0;
    if (a <= 0) return toast.error("Amount must be greater than 0");
    onSubmit({
      id: initial?.id ?? uid(),
      date,
      category,
      amount: a,
      notes: notes.trim() || undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="date" className="text-base">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 text-base" />
      </div>
      <div>
        <Label className="text-base">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-base">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount" className="text-base">Amount</Label>
        <Input id="amount" type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg font-semibold" autoFocus />
      </div>
      <div>
        <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-base" />
      </div>
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" size="lg" className="flex-1 text-base font-semibold">{submitLabel}</Button>
      </div>
    </form>
  );
}
