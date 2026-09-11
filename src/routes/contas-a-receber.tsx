import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/PageShell';
import { MonthSelector } from '@/components/expenses/MonthSelector';
import { ReceivableForm } from '@/components/receivables/ReceivableForm';
import { ReceivableSummaryCards } from '@/components/receivables/ReceivableSummaryCards';
import { ReceivableFilters } from '@/components/receivables/ReceivableFilters';
import { ReceivableList } from '@/components/receivables/ReceivableList';
import { ReceivableMonthSummary } from '@/components/receivables/ReceivableMonthSummary';
import { ReceivableChart } from '@/components/receivables/ReceivableChart';
import {
  useReceivables,
  useReceivableSummary,
  useAllReceivables,
} from '@/hooks/use-receivables';
import { ReceivableFilters as FiltersType } from '@/lib/receivable-types';

export const Route = createFileRoute('/contas-a-receber')({
  head: () => ({
    meta: [
      { title: 'Contas a Receber | Painel Financeiro' },
      {
        name: 'description',
        content: 'Gerencie entradas futuras, acompanhe recebimentos, vencimentos e histórico.',
      },
      { property: 'og:title', content: 'Contas a Receber | Painel Financeiro' },
      {
        property: 'og:description',
        content: 'Gerencie entradas futuras, acompanhe recebimentos, vencimentos e histórico.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Page,
});

function Page() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [year, setYear] = useState(today.getFullYear());

  const [filters, setFilters] = useState<FiltersType>({
    status: 'Todos',
    sortBy: 'vencimento',
    sortOrder: 'asc',
  });

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  // Combined filters for API query
  const queryFilters: FiltersType = {
    ...filters,
    month,
    year,
  };

  const { data: receivables = [], isLoading: isReceivablesLoading } =
    useReceivables(queryFilters);
  const { data: summary, isLoading: isSummaryLoading } = useReceivableSummary(
    month,
    year
  );
  const { data: allReceivables = [], isLoading: isAllLoading } =
    useAllReceivables();

  return (
    <PageShell
      title="Contas a Receber"
      subtitle="Controle seus recebimentos previstos, acompanhe vencimentos e faça a gestão do seu fluxo de caixa."
    >
      <div className="flex flex-col gap-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <MonthSelector month={month} year={year} onChange={handleMonthChange} />
          <div className="w-full sm:w-auto">
            <ReceivableForm />
          </div>
        </div>

        {/* Top Summary Cards (5 Cards) */}
        <ReceivableSummaryCards
          summary={summary}
          isLoading={isSummaryLoading}
        />

        {/* Month Progress & Breakdown Summary */}
        <ReceivableMonthSummary
          summary={summary}
          isLoading={isSummaryLoading}
        />

        {/* Filters Bar & List */}
        <div className="space-y-4">
          <ReceivableFilters filters={filters} onChange={setFilters} />
          <ReceivableList
            receivables={receivables}
            isLoading={isReceivablesLoading}
          />
        </div>

        {/* Visual Charts */}
        <ReceivableChart
          allReceivables={allReceivables}
          currentMonth={month}
          currentYear={year}
          isLoading={isAllLoading}
        />
      </div>
    </PageShell>
  );
}
