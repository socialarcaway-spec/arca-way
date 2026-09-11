import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchExpenses, Expense } from '@/lib/api';
import { ExpenseFilters } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ExpenseListProps {
  month: number;
  year: number;
}

export function ExpenseList({ month, year }: ExpenseListProps) {
  const filters: ExpenseFilters = { month, year };
  const { data: expenses = [], isLoading } = useQuery<Expense[]>(['expenses', month, year], () =>
    fetchExpenses(filters),
  );

  const rows = useMemo(() => {
    return expenses.map((e) => {
      const statusColor =
        e.status === 'Pago'
          ? 'bg-green-100 text-green-800'
          : e.status === 'Pendente'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800';
      return (
        <TableRow key={e.id}>
          <TableCell>{e.descricao}</TableCell>
          <TableCell>{e.categoria}</TableCell>
          <TableCell>{new Date(e.dataVencimento).toLocaleDateString('pt-BR')}</TableCell>
          <TableCell>{e.dataPagamento ? new Date(e.dataPagamento).toLocaleDateString('pt-BR') : '-'}</TableCell>
          <TableCell>{`R$ ${e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</TableCell>
          <TableCell>
            <Badge className={statusColor}>{e.status}</Badge>
          </TableCell>
        </TableRow>
      );
    });
  }, [expenses]);

  if (isLoading) return null; // could render skeletons

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{rows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
