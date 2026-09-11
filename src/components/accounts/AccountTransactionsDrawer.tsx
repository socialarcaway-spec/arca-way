import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BankAccount, AccountTransaction } from '@/lib/account-types';
import { useAccountTransactions } from '@/hooks/use-accounts';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Search,
  Calendar,
  Layers,
  Inbox,
} from 'lucide-react';

interface AccountTransactionsDrawerProps {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenNewTransaction?: () => void;
}

export function AccountTransactionsDrawer({
  account,
  open,
  onOpenChange,
  onOpenNewTransaction,
}: AccountTransactionsDrawerProps) {
  const { data: allTransactions = [], isLoading } = useAccountTransactions(account?.id);
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  if (!account) return null;

  const filtered = allTransactions.filter((tx) => {
    if (filterType === 'entradas') {
      if (tx.tipo !== 'receita' && tx.tipo !== 'transferencia_entrada') return false;
    } else if (filterType === 'saidas') {
      if (tx.tipo !== 'despesa' && tx.tipo !== 'transferencia_saida') return false;
    } else if (filterType === 'transferencias') {
      if (tx.tipo !== 'transferencia_entrada' && tx.tipo !== 'transferencia_saida') return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.descricao.toLowerCase().includes(q);
      const matchCat = tx.categoria?.toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }

    return true;
  });

  const formatBRL = (cents: number) => {
    const val = cents / 100;
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTxIcon = (tipo: AccountTransaction['tipo']) => {
    switch (tipo) {
      case 'receita':
      case 'transferencia_entrada':
        return <ArrowUpRight className="size-4 text-emerald-500" />;
      case 'despesa':
      case 'transferencia_saida':
        return <ArrowDownRight className="size-4 text-rose-500" />;
      case 'ajuste_saldo':
        return <SlidersHorizontal className="size-4 text-primary" />;
      default:
        return <ArrowLeftRight className="size-4 text-muted-foreground" />;
    }
  };

  const isPositive = (tipo: AccountTransaction['tipo']) => {
    return tipo === 'receita' || tipo === 'transferencia_entrada';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-6 flex flex-col justify-between overflow-y-auto bg-card border-border"
      >
        <div className="space-y-4">
          <SheetHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: account.cor }}
              />
              <SheetTitle className="text-lg font-bold text-foreground">
                Extrato · {account.nome}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              {account.instituicao} · Saldo atual: {formatBRL(account.saldo)}
            </SheetDescription>
          </SheetHeader>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar no extrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-xs pl-8 bg-background border-border"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'entradas', label: 'Entradas' },
              { id: 'saidas', label: 'Saídas' },
              { id: 'transferencias', label: 'Transferências' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filterType === f.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="space-y-2 pt-2">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Carregando movimentações...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Inbox className="size-8 mx-auto text-muted-foreground opacity-50" />
                <p className="text-xs font-medium text-foreground">
                  Nenhuma movimentação encontrada.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Não há lançamentos para os filtros selecionados.
                </p>
              </div>
            ) : (
              filtered.map((tx) => {
                const positive = isPositive(tx.tipo);
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border border-border bg-background/50 hover:bg-secondary/30 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          positive
                            ? 'bg-emerald-500/10'
                            : tx.tipo === 'ajuste_saldo'
                            ? 'bg-primary-soft'
                            : 'bg-rose-500/10'
                        }`}
                      >
                        {getTxIcon(tx.tipo)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {tx.descricao}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>{tx.data}</span>
                          {tx.categoria && <span>· {tx.categoria}</span>}
                          {tx.origem === 'open_finance' && (
                            <span className="text-[9px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 px-1 py-0.2 rounded">
                              OF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold ${
                          positive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : tx.tipo === 'ajuste_saldo'
                            ? 'text-foreground'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {positive ? '+' : tx.tipo === 'ajuste_saldo' ? '' : '-'}
                        {formatBRL(tx.valor)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Button at bottom */}
        {account.origem === 'manual' && onOpenNewTransaction && (
          <div className="pt-4 border-t border-border mt-4">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenNewTransaction();
              }}
              className="w-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              + Adicionar nova movimentação
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
