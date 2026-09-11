import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { SummaryCards } from "@/components/expenses/SummaryCards";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { MonthSelector } from "@/components/expenses/MonthSelector";
import { ExpenseChart } from "@/components/expenses/ExpenseChart";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas | Painel financeiro" },
      { name: "description", content: "Acompanhe e organize suas despesas pessoais." },
      { property: "og:title", content: "Despesas | Painel financeiro" },
      { property: "og:description", content: "Acompanhe e organize suas despesas pessoais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [year, setYear] = useState(today.getFullYear());

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <PageShell title="Despesas" subtitle="Acompanhe e organize seus gastos.">
      <div className="flex flex-col gap-6">
        {/* Controls Bar: Month Selector & Nova Despesa Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <MonthSelector month={month} year={year} onChange={handleMonthChange} />
          <div className="w-full sm:w-auto">
            <ExpenseForm />
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards month={month} year={year} />

        {/* Category Breakdown Chart */}
        <ExpenseChart month={month} year={year} />

        {/* Main Expense List */}
        <ExpenseList month={month} year={year} />
      </div>
    </PageShell>
  );
}
