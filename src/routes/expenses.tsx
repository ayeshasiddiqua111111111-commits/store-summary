import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ExpenseForm } from "@/components/ExpenseForm";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseCategory,
  formatMoney,
  inRange,
  useExpenses,
} from "@/lib/storage";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — ShopTrack" },
      { name: "description", content: "Track shop expenses by category so nothing slips through." },
      { property: "og:title", content: "Expenses — ShopTrack" },
      { property: "og:description", content: "Track shop expenses by category so nothing slips through." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { items, add, update, remove } = useExpenses();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cat, setCat] = useState<"All" | ExpenseCategory>("All");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items
      .filter((e) => inRange(e.date, from || undefined, to || undefined))
      .filter((e) => cat === "All" || e.category === cat)
      .filter((e) => !ql || e.category.toLowerCase().includes(ql) || e.date.includes(ql) || (e.notes ?? "").toLowerCase().includes(ql))
      .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  }, [items, q, from, to, cat]);

  const total = filtered.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} records · {formatMoney(total)}</p>
        </div>
        <Button size="lg" onClick={() => { setEditing(null); setOpen(true); }} className="h-12 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
          <Plus className="h-5 w-5" /> Add
        </Button>
      </header>

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search category, note or date" className="h-12 pl-9 text-base" />
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
        <div>
          <Label className="text-xs uppercase text-muted-foreground">Category</Label>
          <Select value={cat} onValueChange={(v) => setCat(v as ExpenseCategory | "All")}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-base text-muted-foreground">No expenses match.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{e.category}</p>
                <p className="text-xs text-muted-foreground">{e.date}</p>
                {e.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{e.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-accent">−{formatMoney(e.amount)}</p>
                <div className="mt-1 flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(e); setOpen(true); }} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmId(e.id)} aria-label="Delete">
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
            <DialogTitle className="text-xl">{editing ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            initial={editing ?? undefined}
            submitLabel={editing ? "Save changes" : "Save Expense"}
            onCancel={() => setOpen(false)}
            onSubmit={(exp) => {
              if (editing) {
                update(editing.id, exp);
                toast.success("Expense updated");
              } else {
                add(exp);
                toast.success("Expense added");
              }
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  remove(confirmId);
                  toast.success("Expense deleted");
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
