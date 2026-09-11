import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowLeftRight,
  Target,
  BarChart3,
  PieChart,
  ReceiptText,
  HandCoins,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel financeiro | Saldo, receitas e despesas" },
      {
        name: "description",
        content:
          "Acompanhe saldo total, receitas, despesas, lucro líquido, fluxo de caixa e patrimônio em um painel escuro e direto.",
      },
      { property: "og:title", content: "Painel financeiro | Saldo, receitas e despesas" },
      {
        property: "og:description",
        content:
          "Saldo total, receita e despesa do mês, lucro líquido, fluxo de caixa dos últimos 6 meses e patrimônio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

import { useAccounts } from "@/hooks/use-accounts";

const brl = (v: number) =>
  `${v < 0 ? "-" : ""}R$ ${Math.abs(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const shortcuts = [
  { icon: Wallet, label: "Contas", to: "/contas" },
  { icon: ReceiptText, label: "Mensais", to: "/contas-a-pagar" },
  { icon: HandCoins, label: "A Receber", to: "/contas-a-receber" },
  { icon: CreditCard, label: "Cartões", to: "/cartoes" },
  { icon: ArrowLeftRight, label: "Movimentações", to: "/movimentacoes" },
  { icon: Target, label: "Metas", to: "/metas" },
  { icon: BarChart3, label: "Fluxo", to: "/fluxo" },
] as const;

const cashflow = [
  { mes: "abr.", receitas: 0, despesas: 0 },
  { mes: "mai.", receitas: 0, despesas: 0 },
  { mes: "jun.", receitas: 0, despesas: 0 },
  { mes: "jul.", receitas: 0, despesas: 0 },
  { mes: "ago.", receitas: 3200, despesas: 15800 },
  { mes: "set.", receitas: 0, despesas: 0 },
];

function Index() {
  const { data: accounts = [] } = useAccounts();
  const totalBalance = accounts.reduce((acc, a) => acc + (a.saldo || 0), 0) / 100;

  const stats = [
    { icon: Wallet, label: "Saldo total", value: totalBalance, active: true },
    { icon: TrendingUp, label: "Receita do mês", value: 0 },
    { icon: TrendingDown, label: "Despesa do mês", value: 0, dim: true },
    { icon: DollarSign, label: "Lucro líquido", value: 0 },
  ];
  return (
    <main className="px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm text-muted-foreground">Boa tarde,</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground">Miqueias</h1>

        <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, active, dim }) => (
            <article
              key={label}
              className={`rounded-2xl border bg-card p-5 ${
                active ? "border-primary/60" : "border-border"
              }`}
            >
              <span
                className={`inline-flex size-9 items-center justify-center rounded-lg ${
                  dim ? "bg-secondary text-muted-foreground" : "bg-primary-soft text-primary"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <p className="mt-6 text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{brl(value)}</p>
            </article>
          ))}
        </section>

        <nav className="mt-5 flex flex-wrap gap-3">
          {shortcuts.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex w-[86px] flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 transition-colors hover:border-primary/50"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-4" />
              </span>
              <span className="text-[11px] font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </nav>

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Fluxo de caixa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Receitas vs despesas · últimos 6 meses
            </p>
            <div className="mt-6 w-full">
              <ResponsiveContainer width="100%" height={240} minWidth={0}>
                <BarChart data={cashflow} barGap={2}>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    domain={[0, 20000]}
                    ticks={[0, 5000, 10000, 15000, 20000]}
                    tickFormatter={(v: number) => `${v / 1000}k`}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  />
                  <Bar dataKey="receitas" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="despesas" fill="var(--color-neutral-bar)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <PieChart className="size-4 text-primary" />
              Patrimônio
            </h2>
            <p className="mt-5 text-3xl font-bold text-foreground">{brl(totalBalance)}</p>

            <ul className="mt-6 space-y-5">
              <li>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="size-2.5 rounded-full bg-primary" />
                    Contas
                  </span>
                  <span className="font-medium text-foreground">{brl(totalBalance)}</span>
                </div>
                <div className="mt-3 h-[3px] rounded-full bg-primary" />
              </li>
              <li>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="size-2.5 rounded-full bg-neutral-bar" />
                    Investimentos
                  </span>
                  <span className="font-medium text-foreground">{brl(0)}</span>
                </div>
                <div className="mt-3 h-[3px] rounded-full bg-secondary" />
              </li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
