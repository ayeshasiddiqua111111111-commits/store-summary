import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  formatMoney,
  inRange,
  startOfMonthISO,
  startOfWeekISO,
  todayISO,
  useExpenses,
  useSales,
} from "@/lib/storage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — ShopTrack" },
      { name: "description", content: "Daily, weekly, monthly and custom reports for your shop." },
      { property: "og:title", content: "Reports — ShopTrack" },
      { property: "og:description", content: "See sales, expenses and profit over time." },
    ],
  }),
  component: ReportsPage,
});

type Preset = "day" | "week" | "month" | "custom";

function ReportsPage() {
  const { items: sales } = useSales();
  const { items: expenses } = useExpenses();
  const [preset, setPreset] = useState<Preset>("week");
  const today = todayISO();
  const [from, setFrom] = useState(startOfWeekISO());
  const [to, setTo] = useState(today);

  const setPresetRange = (p: Preset) => {
    setPreset(p);
    if (p === "day") { setFrom(today); setTo(today); }
    else if (p === "week") { setFrom(startOfWeekISO()); setTo(today); }
    else if (p === "month") { setFrom(startOfMonthISO()); setTo(today); }
  };

  const filteredSales = useMemo(
    () => sales.filter((s) => inRange(s.date, from, to)),
    [sales, from, to],
  );
  const filteredExp = useMemo(
    () => expenses.filter((e) => inRange(e.date, from, to)),
    [expenses, from, to],
  );

  const totalSales = filteredSales.reduce((s, x) => s + x.total, 0);
  const totalExp = filteredExp.reduce((s, x) => s + x.amount, 0);
  const profit = totalSales - totalExp;

  // Build per-day series
  const series = useMemo(() => {
    if (!from || !to) return [];
    const map = new Map<string, { date: string; sales: number; expenses: number; profit: number }>();
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      map.set(iso, { date: iso, sales: 0, expenses: 0, profit: 0 });
    }
    filteredSales.forEach((s) => {
      const row = map.get(s.date);
      if (row) row.sales += s.total;
    });
    filteredExp.forEach((e) => {
      const row = map.get(e.date);
      if (row) row.expenses += e.amount;
    });
    return Array.from(map.values()).map((r) => ({ ...r, profit: r.sales - r.expenses }));
  }, [filteredSales, filteredExp, from, to]);

  const fmtDate = (d: string) => d.slice(5); // MM-DD
  const chartTooltipFmt = (v: number) => formatMoney(Number(v));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">See how your shop is doing over time.</p>
      </header>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {(["day", "week", "month", "custom"] as Preset[]).map((p) => (
            <Button
              key={p}
              variant={preset === p ? "default" : "outline"}
              onClick={() => setPresetRange(p)}
              className="h-11 capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">From</Label>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreset("custom"); }} className="h-11" />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">To</Label>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreset("custom"); }} className="h-11" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="Sales" value={formatMoney(totalSales)} tone="success" />
        <SummaryTile label="Expenses" value={formatMoney(totalExp)} tone="accent" />
        <SummaryTile label="Net Profit" value={formatMoney(profit)} tone={profit >= 0 ? "primary" : "destructive"} />
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-base font-semibold">Sales, expenses & profit</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={chartTooltipFmt} labelFormatter={fmtDate} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} name="Sales" />
              <Line type="monotone" dataKey="expenses" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={false} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-base font-semibold">Sales vs. Expenses</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={chartTooltipFmt} labelFormatter={fmtDate} />
              <Legend />
              <Bar dataKey="sales" fill="var(--color-chart-1)" name="Sales" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-chart-2)" name="Expenses" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "accent" | "primary" | "destructive";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "accent"
      ? "text-accent"
      : tone === "destructive"
      ? "text-destructive"
      : "text-primary";
  return (
    <Card className="p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={"mt-1 text-lg font-bold sm:text-xl " + toneCls}>{value}</p>
    </Card>
  );
}
