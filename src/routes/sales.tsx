import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SaleForm } from "@/components/SaleForm";
import { formatMoney, inRange, type Sale, useSales } from "@/lib/storage";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales — ShopTrack" },
      { name: "description", content: "Record and manage every sale in your shop." },
      { property: "og:title", content: "Sales — ShopTrack" },
      { property: "og:description", content: "Record and manage every sale in your shop." },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const { items, add, update, remove } = useSales();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items
      .filter((s) => inRange(s.date, from || undefined, to || undefined))
      .filter((s) => !ql || s.item.toLowerCase().includes(ql) || s.date.includes(ql))
      .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  }, [items, q, from, to]);

  const total = filtered.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} records · {formatMoney(total)}</p>
        </div>
        <Button size="lg" onClick={() => { setEditing(null); setOpen(true); }} className="h-12 gap-2 font-semibold">
          <Plus className="h-5 w-5" /> Add
        </Button>
      </header>

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item or date" className="h-12 pl-9 text-base" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11" />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11" />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-base text-muted-foreground">No sales yet.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-success/15 text-success">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{s.item}</p>
                <p className="text-xs text-muted-foreground">
                  {s.date} · {s.quantity} × {formatMoney(s.price)}
                </p>
                {s.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{s.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-success">{formatMoney(s.total)}</p>
                <div className="mt-1 flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmId(s.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing ? "Edit Sale" : "Add Sale"}</DialogTitle>
          </DialogHeader>
          <SaleForm
            initial={editing ?? undefined}
            submitLabel={editing ? "Save changes" : "Save Sale"}
            onCancel={() => setOpen(false)}
            onSubmit={(sale) => {
              if (editing) {
                update(editing.id, sale);
                toast.success("Sale updated");
              } else {
                add(sale);
                toast.success("Sale added");
              }
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  remove(confirmId);
                  toast.success("Sale deleted");
                }
                setConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
