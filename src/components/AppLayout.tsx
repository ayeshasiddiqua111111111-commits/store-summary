import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, Receipt, BarChart3, Store } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/sales", label: "Sales", icon: ShoppingBag },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">ShopTrack</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-secondary",
                  )}
                >
                  <n.icon className="h-5 w-5" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:hidden">
        <ul className="mx-auto flex max-w-5xl">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <li key={n.to} className="flex-1">
                <Link
                  to={n.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <n.icon className={cn("h-6 w-6", active && "scale-110 transition-transform")} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Toaster richColors position="top-center" />
    </div>
  );
}
