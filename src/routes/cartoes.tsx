import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões | Painel financeiro" },
      { name: "description", content: "Acompanhe faturas, limites e vencimentos dos cartões." },
      { property: "og:title", content: "Cartões | Painel financeiro" },
      { property: "og:description", content: "Acompanhe faturas, limites e vencimentos dos cartões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Cartões" subtitle="Faturas e limites dos seus cartões">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
