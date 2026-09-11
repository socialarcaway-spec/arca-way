import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/fluxo")({
  head: () => ({
    meta: [
      { title: "Fluxo | Painel financeiro" },
      { name: "description", content: "Compare receitas e despesas mês a mês." },
      { property: "og:title", content: "Fluxo | Painel financeiro" },
      { property: "og:description", content: "Compare receitas e despesas mês a mês." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Fluxo" subtitle="Receitas vs despesas por mês">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
