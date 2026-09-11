import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Clock,
  AlertTriangle,
  Loader2,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  Inbox,
} from 'lucide-react';
import { Receivable } from '@/lib/receivable-types';
import {
  useMarkAsReceived,
  useMarkAsPartiallyReceived,
  useDeleteReceivable,
  useDeleteReceivableAndFuture,
  useDuplicateReceivable,
} from '@/hooks/use-receivables';
import { ReceivableForm } from './ReceivableForm';
import { Skeleton } from '@/components/ui/skeleton';

interface ReceivableListProps {
  receivables: Receivable[];
  isLoading?: boolean;
}

export function ReceivableList({ receivables, isLoading }: ReceivableListProps) {
  const markAsReceivedMutation = useMarkAsReceived();
  const markAsPartialMutation = useMarkAsPartiallyReceived();
  const deleteMutation = useDeleteReceivable();
  const deleteFutureMutation = useDeleteReceivableAndFuture();
  const duplicateMutation = useDuplicateReceivable();

  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteFutureId, setDeleteFutureId] = useState<string | null>(null);

  // Partial receipt modal state
  const [partialItem, setPartialItem] = useState<Receivable | null>(null);
  const [partialValorText, setPartialValorText] = useState('');

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const handleMarkAsReceived = async (id: string) => {
    await markAsReceivedMutation.mutateAsync(id);
  };

  const handleOpenPartialModal = (item: Receivable) => {
    setPartialItem(item);
    const initialVal = item.valorRecebido
      ? (item.valorRecebido / 100).toFixed(2).replace('.', ',')
      : (item.valor / 2 / 100).toFixed(2).replace('.', ',');
    setPartialValorText(initialVal);
  };

  const handleSavePartial = async () => {
    if (!partialItem) return;
    const clean = partialValorText.replace(/[^\d.,]/g, '').replace(',', '.');
    const cents = Math.round(parseFloat(clean) * 100);
    if (isNaN(cents) || cents <= 0) return;

    await markAsPartialMutation.mutateAsync({
      id: partialItem.id,
      valorRecebidoCents: cents,
    });
    setPartialItem(null);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Recebido':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Recebido
          </Badge>
        );
      case 'Atrasado':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 border-rose-500/20 gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" /> Atrasado
          </Badge>
        );
      case 'Parcial':
        return (
          <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 border-sky-500/20 gap-1 font-medium">
            <PieChart className="w-3 h-3" /> Parcial
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border-amber-500/20 gap-1 font-medium">
            <Clock className="w-3 h-3" /> Pendente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (receivables.length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
          <Inbox className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Nenhuma conta a receber encontrada</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Não existem lançamentos para os filtros aplicados neste período. Clique no botão abaixo para adicionar.
        </p>
        <ReceivableForm />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
        {/* Table View Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[30%]">Descrição</TableHead>
                <TableHead>Origem / Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((item) => {
                const isMarkingLoading =
                  markAsReceivedMutation.isPending &&
                  markAsReceivedMutation.variables === item.id;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Descrição */}
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-foreground font-semibold flex items-center gap-1.5">
                          {item.descricao}
                          {item.parcelado && item.parcelaNumero && item.totalParcelas && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal border border-border/40">
                              {item.parcelaNumero}/{item.totalParcelas}
                            </span>
                          )}
                          {item.recorrente && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-normal">
                              Recorrente
                            </span>
                          )}
                        </span>
                        {item.observacao && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {item.observacao}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Origem / Categoria */}
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-foreground">{item.origem}</span>
                        <span className="text-muted-foreground">{item.categoria}</span>
                      </div>
                    </TableCell>

                    {/* Data */}
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatDate(item.dataPrevisao)}
                        </span>
                        {item.dataRecebimento && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            Rec: {formatDate(item.dataRecebimento)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Valor */}
                    <TableCell className="text-right font-bold text-foreground">
                      <div>
                        {formatBRL(item.valor)}
                        {item.status === 'Parcial' && item.valorRecebido && (
                          <div className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                            Rec: {formatBRL(item.valorRecebido)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      {renderStatusBadge(item.status)}
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {item.status !== 'Recebido' && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsReceived(item.id)}
                              disabled={isMarkingLoading}
                              className="text-emerald-600 dark:text-emerald-400 font-medium"
                            >
                              {isMarkingLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                              )}
                              Marcar como Recebido
                            </DropdownMenuItem>
                          )}

                          {item.status !== 'Recebido' && (
                            <DropdownMenuItem onClick={() => handleOpenPartialModal(item)}>
                              <PieChart className="w-4 h-4 mr-2 text-sky-500" />
                              Recebimento Parcial
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => setEditingReceivable(item)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => duplicateMutation.mutate(item.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {item.grupoParcelamentoId ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(item.id)}
                                className="text-rose-600 dark:text-rose-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir esta parcela
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteFutureId(item.id)}
                                className="text-rose-600 dark:text-rose-400"
                              >
                                <Layers className="w-4 h-4 mr-2" />
                                Excluir esta e próximas
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item.id)}
                              className="text-rose-600 dark:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-border/60">
          {receivables.map((item) => {
            const isMarkingLoading =
              markAsReceivedMutation.isPending &&
              markAsReceivedMutation.variables === item.id;

            return (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                      {item.descricao}
                      {item.parcelado && item.parcelaNumero && item.totalParcelas && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal border border-border/40">
                          {item.parcelaNumero}/{item.totalParcelas}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.origem} • {item.categoria}
                    </p>
                  </div>
                  {renderStatusBadge(item.status)}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Vencimento</p>
                    <p className="text-xs font-medium text-foreground">
                      {formatDate(item.dataPrevisao)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-base font-bold text-foreground">
                      {formatBRL(item.valor)}
                    </p>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  {item.status !== 'Recebido' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-emerald-600 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 gap-1"
                      onClick={() => handleMarkAsReceived(item.id)}
                      disabled={isMarkingLoading}
                    >
                      {isMarkingLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Recebido
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => setEditingReceivable(item)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-rose-500 hover:bg-rose-500/10"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingReceivable && (
        <ReceivableForm
          receivable={editingReceivable}
          open={Boolean(editingReceivable)}
          onOpenChange={(open) => {
            if (!open) setEditingReceivable(null);
          }}
        />
      )}

      {/* Partial Receipt Modal */}
      <Dialog
        open={Boolean(partialItem)}
        onOpenChange={(open) => {
          if (!open) setPartialItem(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-sky-500" />
              Recebimento Parcial
            </DialogTitle>
            <DialogDescription>
              Informe o valor recebido parcialmente para "{partialItem?.descricao}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>Valor Total da Conta:</span>
              <span className="font-semibold text-foreground">
                {partialItem ? formatBRL(partialItem.valor) : ''}
              </span>
            </div>
            <div className="space-y-1">
              <Label htmlFor="partialVal">Valor Recebido (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">
                  R$
                </span>
                <Input
                  id="partialVal"
                  className="pl-9"
                  value={partialValorText}
                  onChange={(e) => setPartialValorText(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartialItem(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={handleSavePartial}
              disabled={markAsPartialMutation.isPending}
            >
              {markAsPartialMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Delete */}
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta a Receber?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. A conta será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog Delete Future */}
      <AlertDialog
        open={Boolean(deleteFutureId)}
        onOpenChange={(open) => {
          if (!open) setDeleteFutureId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Esta e Próximas Parcelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá esta parcela e todas as parcelas subsequentes do mesmo parcelamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteFutureId) deleteFutureMutation.mutate(deleteFutureId);
                setDeleteFutureId(null);
              }}
            >
              Excluir Parcelas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
