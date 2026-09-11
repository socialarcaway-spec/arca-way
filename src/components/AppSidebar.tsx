import { Link } from "@tanstack/react-router";
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
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Início", icon: LayoutDashboard },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/fluxo", label: "Fluxo", icon: BarChart3 },
  { to: "/investimentos", label: "Investimentos", icon: LineChart },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <span className="px-2 text-lg font-bold tracking-tight text-foreground">
        Fin<span className="text-primary">.</span>
      </span>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-primary-soft text-primary" }}
          >
            <Icon className="size-4" />
            {label}
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
