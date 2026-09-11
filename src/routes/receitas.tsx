import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/PageShell';
import { FinanceMonthSelector } from '@/components/FinanceMonthSelector';
import { IncomeForm } from '@/components/incomes/IncomeForm';
import { IncomeSummaryCards } from '@/components/incomes/IncomeSummaryCards';
import { IncomeFilters } from '@/components/incomes/IncomeFilters';
import { IncomeList } from '@/components/incomes/IncomeList';
import { IncomeCharts } from '@/components/incomes/IncomeCharts';
import { useIncomes, useIncomeSummary } from '@/hooks/use-incomes';
import { IncomeFilters as FiltersType } from '@/lib/income-types';

export const Route = createFileRoute('/receitas')({
  head: () => ({
    meta: [
      { title: 'Receitas | Painel Financeiro' },
      {
        name: 'description',
        content: 'Acompanhe suas entradas e entenda de onde vem sua renda.',
      },
      { property: 'og:title', content: 'Receitas | Painel Financeiro' },
      {
        property: 'og:description',
        content: 'Acompanhe suas entradas e entenda de onde vem sua renda.',
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

  const { data: incomes = [], isLoading: isIncomesLoading } = useIncomes(queryFilters);
  const { data: summary, isLoading: isSummaryLoading } = useIncomeSummary(month, year);

  return (
    <PageShell
      title="Receitas"
      subtitle="Acompanhe suas entradas e entenda de onde vem sua renda."
    >
      <div className="flex flex-col gap-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FinanceMonthSelector month={month} year={year} onChange={handleMonthChange} />
          <div className="w-full sm:w-auto">
            <IncomeForm
              open={formOpen}
              onOpenChange={setFormOpen}
              defaultMonth={month}
              defaultYear={year}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <IncomeSummaryCards summary={summary} isLoading={isSummaryLoading} />

        {/* Charts */}
        <IncomeCharts incomes={incomes} />

        {/* Filters and List */}
        <div className="space-y-4">
          <IncomeFilters filters={filters} onChange={setFilters} />
          <IncomeList
            incomes={incomes}
            isLoading={isIncomesLoading}
            onOpenNewIncome={() => setFormOpen(true)}
          />
        </div>
      </div>
    </PageShell>
  );
}
