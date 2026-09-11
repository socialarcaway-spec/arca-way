import { createFileRoute } from "@tanstack/react-router";
import { PageShell, EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Painel financeiro" },
      { name: "description", content: "Ajuste preferências, moeda e notificações do painel." },
      { property: "og:title", content: "Configurações | Painel financeiro" },
      { property: "og:description", content: "Ajuste preferências, moeda e notificações do painel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Configurações" subtitle="Preferências da conta">
      <EmptyCard label="Nenhum registro por aqui ainda." />
    </PageShell>
  );
}
