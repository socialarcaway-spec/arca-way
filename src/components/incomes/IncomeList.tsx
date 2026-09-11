import { useState } from 'react';
import {
  IncomeRecord,
} from '@/lib/income-types';
import {
  useMarkIncomeAsReceived,
  useDeleteIncome,
  useDeleteIncomeAndFuture,
  useDuplicateIncome,
} from '@/hooks/use-incomes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  Layers,
  Repeat,
  FileEdit,
  Copy,
  Trash2,
  TrendingUp,
  AlertCircle,
  Loader2,
  PlusCircle,
} from 'lucide-react';
import { IncomeForm } from './IncomeForm';

interface IncomeListProps {
  incomes: IncomeRecord[];
  isLoading: boolean;
  onOpenNewIncome?: () => void;
}

export function IncomeList({
  incomes,
  isLoading,
  onOpenNewIncome,
}: IncomeListProps) {
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const markAsReceivedMutation = useMarkIncomeAsReceived();
  const deleteMutation = useDeleteIncome();
  const deleteFutureMutation = useDeleteIncomeAndFuture();
  const duplicateMutation = useDuplicateIncome();

  const handleMarkAsReceived = async (income: IncomeRecord) => {
    if (savingId) return; // Prevent double click
    setSavingId(income.id);
    try {
      await markAsReceivedMutation.mutateAsync(income.id);
    } finally {
      setSavingId(null);
    }
  };

  const formatBRL = (cents: number = 0) => {
    const val = cents / 100;
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Recebido':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 font-medium text-xs">
            Recebido
          </Badge>
        );
      case 'Pendente':
      case 'Previsto':
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-0 font-medium text-xs">
            Previsto
          </Badge>
        );
      case 'Atrasado':
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-0 font-medium text-xs">
            Atrasado
          </Badge>
        );
      case 'Parcial':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0 font-medium text-xs">
            Parcial
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Nenhuma receita neste mês.
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Você não possui entradas ou recebimentos cadastrados para o período selecionado.
        </p>
        <div className="mt-5">
          {onOpenNewIncome ? (
            <Button
              onClick={onOpenNewIncome}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              <PlusCircle className="size-4" />
              Cadastrar nova receita
            </Button>
          ) : (
            <IncomeForm
              triggerButton={
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                  <PlusCircle className="size-4" />
                  Cadastrar nova receita
                </Button>
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Origem</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Data</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Valor</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((item) => {
              const isItemSaving = savingId === item.id;
              const isReceived = item.status === 'Recebido';

              return (
                <TableRow
                  key={item.id}
                  className="border-border transition-colors hover:bg-secondary/20"
                >
                  <TableCell className="py-3.5">
                    <div className="font-semibold text-sm text-foreground">
                      {item.descricao}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.parcelado && item.totalParcelas && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary-soft px-1.5 py-0.5 rounded">
                          <Layers className="size-3" />
                          Parcela {item.parcelaNumero || 1}/{item.totalParcelas}
                        </span>
                      )}
                      {item.recorrente && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          <Repeat className="size-3" />
                          {item.frequenciaRecorrencia || 'Recorrente'}
                        </span>
                      )}
                      {item.observacao && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">
                          {item.observacao}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-foreground">
                    <span className="px-2 py-0.5 rounded-md bg-secondary/80 text-foreground text-xs">
                      {item.origem}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {item.categoria}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDate(item.dataPrevisao)}
                    </div>
                    {item.dataRecebimento && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Recebido em {formatDate(item.dataRecebimento)}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-sm font-bold text-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{formatBRL(item.valor)}
                    </span>
                  </TableCell>

                  <TableCell>{getStatusBadge(item.status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isReceived && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isItemSaving}
                          onClick={() => handleMarkAsReceived(item)}
                          className="h-8 gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-medium"
                        >
                          {isItemSaving ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-3.5" />
                              Marcar como recebido
                            </>
                          )}
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-popover border-border">
                          {!isReceived && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsReceived(item)}
                              disabled={isItemSaving}
                              className="gap-2 text-xs cursor-pointer text-emerald-600 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Marcar como recebido
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setEditingIncome(item)}
                            className="gap-2 text-xs cursor-pointer text-foreground"
                          >
                            <FileEdit className="size-3.5" />
                            Editar receita
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateMutation.mutate(item.id)}
                            className="gap-2 text-xs cursor-pointer text-foreground"
                          >
                            <Copy className="size-3.5" />
                            Duplicar
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-border" />

                          {item.grupoParcelamentoId ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => deleteMutation.mutate(item.id)}
                                className="gap-2 text-xs cursor-pointer text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 className="size-3.5" />
                                Excluir esta parcela
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteFutureMutation.mutate(item.id)}
                                className="gap-2 text-xs cursor-pointer text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 className="size-3.5" />
                                Excluir esta e próximas
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(item.id)}
                              className="gap-2 text-xs cursor-pointer text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 className="size-3.5" />
                              Excluir receita
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-3">
        {incomes.map((item) => {
          const isItemSaving = savingId === item.id;
          const isReceived = item.status === 'Recebido';

          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {item.descricao}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] font-medium">
                      {item.origem}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      · {item.categoria}
                    </span>
                    {item.parcelado && item.totalParcelas && (
                      <span className="px-1.5 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium">
                        {item.parcelaNumero || 1}/{item.totalParcelas}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatBRL(item.valor)}
                  </div>
                  <div className="mt-1">{getStatusBadge(item.status)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(item.dataPrevisao)}
                </div>
                {item.dataRecebimento ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Recebido
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400">
                    Previsto
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                {!isReceived ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isItemSaving}
                    onClick={() => handleMarkAsReceived(item)}
                    className="h-8 gap-1 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex-1 mr-2"
                  >
                    {isItemSaving ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        Marcar como recebido
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Recebido em {formatDate(item.dataRecebimento || '')}
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                    <DropdownMenuItem
                      onClick={() => setEditingIncome(item)}
                      className="gap-2 text-xs cursor-pointer text-foreground"
                    >
                      <FileEdit className="size-3.5" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => duplicateMutation.mutate(item.id)}
                      className="gap-2 text-xs cursor-pointer text-foreground"
                    >
                      <Copy className="size-3.5" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="gap-2 text-xs cursor-pointer text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Income Modal */}
      {editingIncome && (
        <IncomeForm
          incomeToEdit={editingIncome}
          open={Boolean(editingIncome)}
          onOpenChange={(open) => !open && setEditingIncome(null)}
        />
      )}
    </>
  );
}
