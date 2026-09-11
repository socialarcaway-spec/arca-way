import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/movimentacoes")({
  head: () => ({
    meta: [
      { title: "Movimentações | Painel financeiro" },
      { name: "description", content: "Histórico completo de receitas e despesas lançadas." },
      { property: "og:title", content: "Movimentações | Painel financeiro" },
      { property: "og:description", content: "Histórico completo de receitas e despesas lançadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Movimentações" subtitle="Todas as entradas e saídas">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
