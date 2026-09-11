import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/investimentos")({
  head: () => ({
    meta: [
      { title: "Investimentos | Painel financeiro" },
      { name: "description", content: "Acompanhe sua carteira de investimentos e a rentabilidade." },
      { property: "og:title", content: "Investimentos | Painel financeiro" },
      { property: "og:description", content: "Acompanhe sua carteira de investimentos e a rentabilidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Investimentos" subtitle="Carteira e rentabilidade">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
