import { useState } from 'react';
import { BankAccount, ACCOUNT_TYPES_LABELS, KNOWN_INSTITUTIONS } from '@/lib/account-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MoreHorizontal,
  RefreshCw,
  ArrowRightLeft,
  PlusCircle,
  FileText,
  Edit2,
  Trash2,
  Globe,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Building,
} from 'lucide-react';
import { useSyncOpenFinanceAccount, useDeleteAccount, useReconnectOpenFinanceAccount } from '@/hooks/use-accounts';

interface AccountCardProps {
  account: BankAccount;
  onUpdateBalance: (account: BankAccount) => void;
  onAddTransaction: (account: BankAccount) => void;
  onTransfer: (account: BankAccount) => void;
  onViewStatement: (account: BankAccount) => void;
  onEdit: (account: BankAccount) => void;
}

export function AccountCard({
  account,
  onUpdateBalance,
  onAddTransaction,
  onTransfer,
  onViewStatement,
  onEdit,
}: AccountCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const syncMutation = useSyncOpenFinanceAccount();
  const reconnectMutation = useReconnectOpenFinanceAccount();
  const deleteMutation = useDeleteAccount();

  const institution = KNOWN_INSTITUTIONS.find(
    (i) => i.key === account.instituicaoKey || i.nome.toLowerCase() === account.instituicao.toLowerCase()
  );

  const formatBRL = (cents: number = 0) => {
    const val = cents / 100;
    return `${val < 0 ? '-' : ''}R$ ${Math.abs(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatSyncTime = (isoString?: string | null) => {
    if (!isoString) return 'Nunca sincronizado';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) {
      return `hoje às ${timeStr}`;
    }
    const dateStr = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    return `${dateStr} às ${timeStr}`;
  };

  const handleSync = async () => {
    if (syncMutation.isPending) return;
    await syncMutation.mutateAsync(account.id);
  };

  const handleReconnect = async () => {
    await reconnectMutation.mutateAsync(account.id);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(account.id);
    setDeleteOpen(false);
  };

  const getStatusBadge = () => {
    if (account.origem === 'manual') {
      return (
        <Badge
          variant="outline"
          className="bg-secondary/60 text-muted-foreground border-border/80 text-[10px] font-medium gap-1 py-0.5 px-2 rounded-md"
        >
          <PenTool className="size-2.5" />
          Manual
        </Badge>
      );
    }

    if (account.statusConexao === 'expirado') {
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-0 text-[10px] font-medium gap-1 py-0.5 px-2 rounded-md">
          <AlertTriangle className="size-2.5" />
          Reconectar conta
        </Badge>
      );
    }

    if (account.statusConexao === 'sincronizacao_necessaria') {
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0 text-[10px] font-medium gap-1 py-0.5 px-2 rounded-md">
          <Clock className="size-2.5" />
          Sincronização necessária
        </Badge>
      );
    }

    return (
      <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border-0 text-[10px] font-semibold gap-1 py-0.5 px-2 rounded-md">
        <CheckCircle2 className="size-2.5 text-sky-500" />
        Open Finance • Conectado
      </Badge>
    );
  };

  return (
    <>
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80 hover:shadow-sm flex flex-col justify-between">
        {/* Top Header Row */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Institution Visual Icon */}
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: account.cor || institution?.cor || '#64748B' }}
              >
                {institution?.logoIniciais || account.instituicao.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {account.instituicao}
                  </span>
                  {getStatusBadge()}
                </div>
                <h3 className="text-sm font-bold text-foreground truncate mt-0.5 max-w-[200px] sm:max-w-none">
                  {account.nome}
                </h3>
              </div>
            </div>

            {/* Menu Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem
                  onClick={() => onViewStatement(account)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <FileText className="size-3.5" />
                  Ver extrato
                </DropdownMenuItem>

                {account.origem === 'manual' ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateBalance(account)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <RefreshCw className="size-3.5" />
                      Atualizar saldo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onAddTransaction(account)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <PlusCircle className="size-3.5" />
                      Adicionar movimentação
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={handleSync}
                    disabled={syncMutation.isPending}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <RefreshCw className={`size-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Sincronizar agora
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => onTransfer(account)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <ArrowRightLeft className="size-3.5" />
                  Transferir desta conta
                </DropdownMenuItem>

                {account.statusConexao === 'expirado' && (
                  <DropdownMenuItem
                    onClick={handleReconnect}
                    className="gap-2 text-xs cursor-pointer text-sky-500 font-medium"
                  >
                    <RefreshCw className="size-3.5" />
                    Reconectar conta
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                  onClick={() => onEdit(account)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                  Editar dados
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 text-xs cursor-pointer text-rose-500"
                >
                  <Trash2 className="size-3.5" />
                  Excluir conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Account Meta & Type */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-secondary/40 px-2 py-0.5 rounded-md text-[11px] font-medium">
              <Building className="size-3" />
              {ACCOUNT_TYPES_LABELS[account.tipo] || account.tipo}
            </span>

            {(account.agencia || account.numeroConta) && (
              <span className="text-[11px] text-muted-foreground/80">
                {account.agencia ? `Ag. ${account.agencia}` : ''}
                {account.agencia && account.numeroConta ? ' · ' : ''}
                {account.numeroConta ? `C/C ${account.numeroConta}${account.digito ? `-${account.digito}` : ''}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Balance & Card Bottom */}
        <div className="mt-6 pt-4 border-t border-border/60">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Saldo atual
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {formatBRL(account.saldo)}
              </span>
            </div>

            {/* Quick Action Buttons */}
            {account.origem === 'manual' ? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateBalance(account)}
                  className="h-8 text-xs border-border hover:bg-secondary gap-1 px-2.5 rounded-lg"
                  title="Atualizar saldo manual"
                >
                  <RefreshCw className="size-3 text-muted-foreground" />
                  Saldo
                </Button>

                <Button
                  size="sm"
                  onClick={() => onAddTransaction(account)}
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1 px-2.5 rounded-lg shadow-xs"
                  title="Adicionar movimentação"
                >
                  <PlusCircle className="size-3" />
                  Lançar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="h-8 text-xs border-border hover:bg-secondary gap-1.5 px-3 rounded-lg"
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className="size-3 animate-spin text-sky-500" />
                    <span className="text-sky-500">Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3 text-sky-500" />
                    Sincronizar
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Open Finance Last Sync Timestamp */}
          {account.origem === 'open_finance' && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              <span>Última atualização: {formatSyncTime(account.ultimaSincronizacao)}</span>
            </div>
          )}
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir conta bancária?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              Tem certeza que deseja remover a conta <strong>"{account.nome}"</strong>? Esta ação excluirá a conta e todo o histórico de lançamentos associado a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs border-border text-foreground">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
