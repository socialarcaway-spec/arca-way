import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Painel financeiro" },
      { name: "description", content: "Gere resumos financeiros por período e categoria." },
      { property: "og:title", content: "Relatórios | Painel financeiro" },
      { property: "og:description", content: "Gere resumos financeiros por período e categoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Relatórios" subtitle="Resumos por período e categoria">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
