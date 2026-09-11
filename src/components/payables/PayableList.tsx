import { useState } from 'react';
import {
  Payable,
  PayableStatus,
} from '@/lib/payable-types';
import {
  useMarkAsPaid,
  useDeletePayable,
  useDeletePayableAndFuture,
  useDuplicatePayable,
} from '@/hooks/use-payables';
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
  AlertCircle,
  Loader2,
  PlusCircle,
} from 'lucide-react';
import { PayableForm } from './PayableForm';

interface PayableListProps {
  payables: Payable[];
  isLoading: boolean;
  onOpenNewAccount?: () => void;
}

export function PayableList({
  payables,
  isLoading,
  onOpenNewAccount,
}: PayableListProps) {
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const markAsPaidMutation = useMarkAsPaid();
  const deleteMutation = useDeletePayable();
  const deleteFutureMutation = useDeletePayableAndFuture();
  const duplicateMutation = useDuplicatePayable();

  const handleMarkAsPaid = async (payable: Payable) => {
    if (savingId) return; // Prevent double click
    setSavingId(payable.id);
    try {
      await markAsPaidMutation.mutateAsync({ id: payable.id });
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

  const getStatusBadge = (status: PayableStatus) => {
    switch (status) {
      case 'Pago':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 font-medium text-xs">
            Pago
          </Badge>
        );
      case 'Pendente':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0 font-medium text-xs">
            Pendente
          </Badge>
        );
      case 'Atrasado':
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-0 font-medium text-xs">
            Atrasado
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

  if (payables.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Nenhuma conta neste mês.
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Você não possui contas a pagar cadastradas ou previstas para o período selecionado.
        </p>
        <div className="mt-5">
          {onOpenNewAccount ? (
            <Button
              onClick={onOpenNewAccount}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              <PlusCircle className="size-4" />
              Cadastrar nova conta
            </Button>
          ) : (
            <PayableForm
              triggerButton={
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                  <PlusCircle className="size-4" />
                  Cadastrar nova conta
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
              <TableHead className="text-xs font-semibold text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Vencimento</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Forma</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Valor</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payables.map((item) => {
              const isItemSaving = savingId === item.id;
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

                  <TableCell className="text-xs text-foreground">
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs">
                      {item.categoria}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDate(item.dataVencimento)}
                    </div>
                    {item.dataPagamento && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Pago em {formatDate(item.dataPagamento)}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {item.formaPagamento}
                  </TableCell>

                  <TableCell className="text-sm font-bold text-foreground">
                    {formatBRL(item.valor)}
                  </TableCell>

                  <TableCell>{getStatusBadge(item.status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'Pago' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isItemSaving}
                          onClick={() => handleMarkAsPaid(item)}
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
                              Marcar como pago
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
                        <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                          {item.status !== 'Pago' && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(item)}
                              disabled={isItemSaving}
                              className="gap-2 text-xs cursor-pointer text-emerald-600 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Marcar como pago
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setEditingPayable(item)}
                            className="gap-2 text-xs cursor-pointer text-foreground"
                          >
                            <FileEdit className="size-3.5" />
                            Editar conta
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
                              Excluir conta
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
        {payables.map((item) => {
          const isItemSaving = savingId === item.id;
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
                      {item.categoria}
                    </span>
                    {item.parcelado && item.totalParcelas && (
                      <span className="px-1.5 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium">
                        {item.parcelaNumero || 1}/{item.totalParcelas}
                      </span>
                    )}
                    {item.recorrente && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px]">
                        Recorrente
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-foreground">
                    {formatBRL(item.valor)}
                  </div>
                  <div className="mt-1">{getStatusBadge(item.status)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Vencimento: {formatDate(item.dataVencimento)}
                </div>
                <span>{item.formaPagamento}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                {item.status !== 'Pago' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isItemSaving}
                    onClick={() => handleMarkAsPaid(item)}
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
                        Marcar como pago
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Pago em {formatDate(item.dataPagamento || '')}
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
                      onClick={() => setEditingPayable(item)}
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

      {/* Edit Payable Modal */}
      {editingPayable && (
        <PayableForm
          payableToEdit={editingPayable}
          open={Boolean(editingPayable)}
          onOpenChange={(open) => !open && setEditingPayable(null)}
        />
      )}
    </>
  );
}
