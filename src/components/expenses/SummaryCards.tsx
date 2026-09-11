import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchExpenses } from '@/lib/api';
import { Expense, ExpenseFilters } from '@/lib/types';

interface SummaryCardsProps {
  month: number;
  year: number;
}

export function SummaryCards({ month, year }: SummaryCardsProps) {
  const filters: ExpenseFilters = { month, year };
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses', month, year],
    queryFn: () => fetchExpenses(filters),
  });

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.valor, 0);
    const paid = expenses.filter((e) => e.status === 'Pago').reduce((sum, e) => sum + e.valor, 0);
    const pending = expenses.filter((e) => e.status !== 'Pago').reduce((sum, e) => sum + e.valor, 0);
    const count = expenses.length;
    return { total, paid, pending, count };
  }, [expenses]);

  const formatBRL = (value: number) =>
    `${value < 0 ? '-' : ''}R$ ${Math.abs(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (isLoading) return null; // Could render skeletons instead

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Despesas do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{formatBRL(summary.total)}</p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{formatBRL(summary.paid)}</p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{formatBRL(summary.pending)}</p>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Quantidade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{summary.count} despesas</p>
        </CardContent>
      </Card>
    </div>
  );
}
