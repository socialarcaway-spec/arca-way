import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/design-system.css";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Target,
  BarChart3,
  LineChart,
  FileText,
  Settings,
  HandCoins,
  ReceiptText,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Início", icon: LayoutDashboard },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/contas-a-pagar", label: "Contas Mensais", icon: ReceiptText },
  { to: "/contas-a-receber", label: "Contas a Receber", icon: HandCoins },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/fluxo", label: "Fluxo", icon: BarChart3 },
  { to: "/investimentos", label: "Investimentos", icon: LineChart },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 border-r border-border bg-card transition-width duration-200 ${collapsed ? "w-16" : "w-64"} hidden lg:flex flex-col`}
    >
      <div className="flex items-center justify-between px-2 py-3">
        <span className="text-lg font-bold tracking-tight text-foreground">
          {!collapsed && (
            <>Fin<span className="text-primary">.</span></>
          )}
        </span>
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          )}
        </button>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${collapsed ? "justify-center" : ""} text-muted-foreground hover:bg-secondary hover:text-foreground`}
            activeProps={{ className: "bg-primary-soft text-primary" }}
            title={collapsed ? label : undefined}
          >
            <Icon className="size-4" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3 lg:hidden">
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground"
          activeProps={{ className: "bg-primary-soft text-primary" }}
        >
          <Icon className="size-3.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
