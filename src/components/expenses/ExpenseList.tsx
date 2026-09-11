import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { fetchExpenses, updateExpense, deleteExpense } from '@/lib/api';
import { Expense, ExpenseFilters, ExpenseStatus } from '@/lib/types';
import { Search, MoreHorizontal, CheckCircle2, Trash2 } from 'lucide-react';

interface ExpenseListProps {
  month: number;
  year: number;
}

export function ExpenseList({ month, year }: ExpenseListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const queryClient = useQueryClient();

  const filters: ExpenseFilters = { month, year };
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses', month, year],
    queryFn: () => fetchExpenses(filters),
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id: number) =>
      updateExpense(id, {
        status: 'Pago',
        dataPagamento: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        search === '' ||
        e.descricao.toLowerCase().includes(search.toLowerCase()) ||
        e.categoria.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'TODOS' || (e.status && e.status.toUpperCase() === statusFilter);

      return matchSearch && matchStatus;
    });
  }, [expenses, search, statusFilter]);

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'Pago':
        return <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-0">Pago</Badge>;
      case 'Pendente':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0">Pendente</Badge>;
      case 'Atrasado':
        return <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-0">Atrasado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (valCents: number) => {
    const val = valCents / 100;
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const datePart = dateStr.split('T')[0] ?? '';
      const parts = datePart.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="mt-4 border-border bg-card">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Lista de Despesas
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar despesa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
            {['TODOS', 'PENDENTE', 'PAGO'].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setStatusFilter(st)}
              >
                {st === 'TODOS' ? 'Todos' : st === 'PENDENTE' ? 'Pendentes' : 'Pagos'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando despesas...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma despesa encontrada para este período.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">
                        {item.descricao}
                        {item.totalParcelas && item.totalParcelas > 1 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({item.parcelaNumero}/{item.totalParcelas})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.categoria}</TableCell>
                      <TableCell>{formatDate(item.dataVencimento)}</TableCell>
                      <TableCell>{formatDate(item.dataPagamento || '')}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(item.valor)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.status !== 'Pago' && (
                              <DropdownMenuItem
                                onClick={() => markAsPaidMutation.mutate(item.id)}
                              >
                                <CheckCircle2 className="mr-2 size-4 text-green-500" />
                                Marcar como pago
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => deleteMutation.mutate(item.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredExpenses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {item.descricao}
                        {item.totalParcelas && item.totalParcelas > 1 && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            ({item.parcelaNumero}/{item.totalParcelas})
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.categoria}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Vencimento</p>
                      <p className="text-xs font-medium">{formatDate(item.dataVencimento)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Valor</p>
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(item.valor)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {item.status !== 'Pago' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => markAsPaidMutation.mutate(item.id)}
                      >
                        <CheckCircle2 className="size-3.5 text-green-500" />
                        Pagar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-red-600 dark:text-red-400"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
