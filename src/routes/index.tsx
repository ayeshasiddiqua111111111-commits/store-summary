import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  ShoppingBag,
  Receipt,
  TrendingUp,
  Calendar as CalendarIcon,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  formatMoney,
  startOfMonthISO,
  startOfWeekISO,
  todayISO,
  useExpenses,
  useSales,
} from "@/lib/storage";
import { SaleForm } from "@/components/SaleForm";
import { ExpenseForm } from "@/components/ExpenseForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ShopTrack" },
      { name: "description", content: "See today's sales, expenses, and profit at a glance." },
      { property: "og:title", content: "Dashboard — ShopTrack" },
      { property: "og:description", content: "See today's sales, expenses, and profit at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { items: sales, add: addSale } = useSales();
  const { items: expenses, add: addExpense } = useExpenses();
  const [saleOpen, setSaleOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);

  const today = todayISO();
  const weekStart = startOfWeekISO();
  const monthStart = startOfMonthISO();

  const totals = useMemo(() => {
    const sum = (arr: { total?: number; amount?: number; date: string }[], from?: string) =>
      arr
        .filter((x) => (from ? x.date >= from : true))
        .reduce((s, x) => s + (x.total ?? x.amount ?? 0), 0);

    const todaySales = sum(sales.filter((s) => s.date === today));
    const todayExp = sum(expenses.filter((e) => e.date === today));
    return {
      todaySales,
      todayExp,
      todayProfit: todaySales - todayExp,
      weekSales: sum(sales, weekStart),
      monthSales: sum(sales, monthStart),
    };
  }, [sales, expenses, today, weekStart, monthStart]);

  const recent = useMemo(() => {
    const combined = [
      ...sales.map((s) => ({ kind: "sale" as const, id: s.id, date: s.date, label: s.item, amount: s.total, createdAt: s.createdAt })),
      ...expenses.map((e) => ({ kind: "expense" as const, id: e.id, date: e.date, label: e.category, amount: e.amount, createdAt: e.createdAt })),
    ];
    return combined.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  }, [sales, expenses]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section>
        <p className="text-sm font-medium text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Hello, shopkeeper 👋</h1>
        <p className="mt-1 text-base text-muted-foreground">Here is how your shop is doing today.</p>
      </section>

      {/* Today profit big card */}
      <Card className="overflow-hidden border-0 bg-primary p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-2 text-primary-foreground/80">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Today's Profit</span>
        </div>
        <p className="mt-2 text-5xl font-bold tracking-tight md:text-6xl">
          {formatMoney(totals.todayProfit)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary-foreground/10 p-3">
            <p className="text-xs uppercase tracking-wide text-primary-foreground/80">Sales</p>
            <p className="mt-1 text-xl font-semibold">{formatMoney(totals.todaySales)}</p>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 p-3">
            <p className="text-xs uppercase tracking-wide text-primary-foreground/80">Expenses</p>
            <p className="mt-1 text-xl font-semibold">{formatMoney(totals.todayExp)}</p>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          className="h-20 flex-col gap-1 text-base font-semibold shadow-md"
          onClick={() => setSaleOpen(true)}
        >
          <Plus className="h-6 w-6" />
          Add Sale
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-20 flex-col gap-1 bg-accent text-accent-foreground text-base font-semibold shadow-md hover:bg-accent/90"
          onClick={() => setExpOpen(true)}
        >
          <Plus className="h-6 w-6" />
          Add Expense
        </Button>
      </div>

      {/* Period cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={CalendarIcon} label="This week" value={formatMoney(totals.weekSales)} sub="Sales" tone="success" />
        <StatCard icon={CalendarDays} label="This month" value={formatMoney(totals.monthSales)} sub="Sales" tone="accent" />
      </div>

      {/* Recent activity */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Link to="/reports" className="text-sm font-medium text-primary hover:underline">
            View reports
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-8 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-base text-muted-foreground">No records yet. Add your first sale or expense.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {recent.map((r) => (
              <div key={r.kind + r.id} className="flex items-center gap-3 p-4">
                <div
                  className={
                    "grid h-11 w-11 place-items-center rounded-xl " +
                    (r.kind === "sale" ? "bg-success/15 text-success" : "bg-accent/15 text-accent")
                  }
                >
                  {r.kind === "sale" ? <ShoppingBag className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <p className={"text-base font-semibold " + (r.kind === "sale" ? "text-success" : "text-accent")}>
                  {r.kind === "sale" ? "+" : "−"}
                  {formatMoney(r.amount)}
                </p>
              </div>
            ))}
          </Card>
        )}
      </section>

      {/* Add sale dialog */}
      <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Sale</DialogTitle>
          </DialogHeader>
          <SaleForm
            onSubmit={(s) => {
              addSale(s);
              setSaleOpen(false);
              toast.success("Sale added");
            }}
            onCancel={() => setSaleOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add expense dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSubmit={(e) => {
              addExpense(e);
              setExpOpen(false);
              toast.success("Expense added");
            }}
            onCancel={() => setExpOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone: "success" | "accent";
}) {
  const toneCls = tone === "success" ? "bg-success/15 text-success" : "bg-accent/15 text-accent";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className={"grid h-9 w-9 place-items-center rounded-lg " + toneCls}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}
