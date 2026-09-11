import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas | Painel financeiro" },
      { name: "description", content: "Veja o saldo de cada conta e o total consolidado." },
      { property: "og:title", content: "Contas | Painel financeiro" },
      { property: "og:description", content: "Veja o saldo de cada conta e o total consolidado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Contas" subtitle="Saldos das suas contas">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
