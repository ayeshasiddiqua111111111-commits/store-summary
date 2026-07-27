import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { type Sale, todayISO, uid } from "@/lib/storage";

type Props = {
  initial?: Sale;
  onSubmit: (sale: Sale) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function SaleForm({ initial, onSubmit, onCancel, submitLabel = "Save Sale" }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [item, setItem] = useState(initial?.item ?? "");
  const [quantity, setQuantity] = useState<string>(String(initial?.quantity ?? 1));
  const [price, setPrice] = useState<string>(String(initial?.price ?? ""));
  const [total, setTotal] = useState<string>(String(initial?.total ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [touchedTotal, setTouchedTotal] = useState(false);

  useEffect(() => {
    if (touchedTotal) return;
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    if (!isNaN(q) && !isNaN(p)) setTotal((q * p).toFixed(2));
  }, [quantity, price, touchedTotal]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return toast.error("Please enter an item name");
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    const t = parseFloat(total) || q * p;
    if (t <= 0) return toast.error("Total must be greater than 0");

    const sale: Sale = {
      id: initial?.id ?? uid(),
      date,
      item: item.trim(),
      quantity: q,
      price: p,
      total: t,
      notes: notes.trim() || undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    onSubmit(sale);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="date" className="text-base">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 text-base" />
      </div>
      <div>
        <Label htmlFor="item" className="text-base">Item name</Label>
        <Input id="item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Bread" className="h-12 text-base" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qty" className="text-base">Quantity</Label>
          <Input id="qty" type="number" inputMode="decimal" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-12 text-base" />
        </div>
        <div>
          <Label htmlFor="price" className="text-base">Price each</Label>
          <Input id="price" type="number" inputMode="decimal" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className="h-12 text-base" />
        </div>
      </div>
      <div>
        <Label htmlFor="total" className="text-base">Total</Label>
        <Input
          id="total"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={total}
          onChange={(e) => { setTouchedTotal(true); setTotal(e.target.value); }}
          className="h-12 text-lg font-semibold"
        />
      </div>
      <div>
        <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-base" />
      </div>
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" className="flex-1 text-base font-semibold">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
