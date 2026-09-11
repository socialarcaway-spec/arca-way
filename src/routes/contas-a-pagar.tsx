import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/PageShell';
import { FinanceMonthSelector } from '@/components/FinanceMonthSelector';
import { PayableForm } from '@/components/payables/PayableForm';
import { PayableSummaryCards } from '@/components/payables/PayableSummaryCards';
import { PayableFilters } from '@/components/payables/PayableFilters';
import { PayableList } from '@/components/payables/PayableList';
import { PayableChart } from '@/components/payables/PayableChart';
import { usePayables, usePayableSummary } from '@/hooks/use-payables';
import { PayableFilters as FiltersType } from '@/lib/payable-types';

export const Route = createFileRoute('/contas-a-pagar')({
  head: () => ({
    meta: [
      { title: 'Contas a Pagar | Painel Financeiro' },
      {
        name: 'description',
        content: 'Organize seus compromissos e acompanhe tudo o que ainda precisa ser pago.',
      },
      { property: 'og:title', content: 'Contas a Pagar | Painel Financeiro' },
      {
        property: 'og:description',
        content: 'Organize seus compromissos e acompanhe tudo o que ainda precisa ser pago.',
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

  const [formOpen, setFormOpen] = useState(false);

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const queryFilters: FiltersType = {
    ...filters,
    month,
    year,
  };

  const { data: payables = [], isLoading: isPayablesLoading } = usePayables(queryFilters);
  const { data: summary, isLoading: isSummaryLoading } = usePayableSummary(month, year);

  return (
    <PageShell
      title="Contas a Pagar"
      subtitle="Organize seus compromissos e acompanhe tudo o que ainda precisa ser pago."
    >
      <div className="flex flex-col gap-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FinanceMonthSelector month={month} year={year} onChange={handleMonthChange} />
          <div className="w-full sm:w-auto">
            <PayableForm
              open={formOpen}
              onOpenChange={setFormOpen}
              defaultMonth={month}
              defaultYear={year}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <PayableSummaryCards summary={summary} isLoading={isSummaryLoading} />

        {/* Charts */}
        <PayableChart payables={payables} />

        {/* Filters and List */}
        <div className="space-y-4">
          <PayableFilters filters={filters} onChange={setFilters} />
          <PayableList
            payables={payables}
            isLoading={isPayablesLoading}
            onOpenNewAccount={() => setFormOpen(true)}
          />
        </div>
      </div>
    </PageShell>
  );
}
