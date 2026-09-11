import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas | Painel financeiro" },
      { name: "description", content: "Defina metas de economia e acompanhe o progresso." },
      { property: "og:title", content: "Metas | Painel financeiro" },
      { property: "og:description", content: "Defina metas de economia e acompanhe o progresso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Metas" subtitle="Objetivos financeiros e progresso">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
