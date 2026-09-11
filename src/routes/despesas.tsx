import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageShell, EmptyCard } from '@/components/PageShell';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { SummaryCards } from '@/components/expenses/SummaryCards';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { MonthSelector } from '@/components/expenses/MonthSelector';

export const Route = createFileRoute('/despesas')({
  head: () => (
    {
      meta: [
        { title: 'Despesas | Painel financeiro' },
        { name: 'description', content: 'Gerencie e visualize suas despesas pessoais.' },
        { property: 'og:title', content: 'Despesas | Painel financeiro' },
        { property: 'og:description', content: 'Gerencie e visualize suas despesas pessoais.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    }
  ),
  component: Page,
});

function Page() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1‑indexed
  const [year, setYear] = useState(today.getFullYear());

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <PageShell title="Despesas" subtitle="Acompanhe e organize seus gastos.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <MonthSelector month={month} year={year} onChange={handleMonthChange} />
          <ExpenseForm />
        </div>
        <SummaryCards month={month} year={year} />
        <ExpenseList month={month} year={year} />
      </div>
    </PageShell>
  );
}
