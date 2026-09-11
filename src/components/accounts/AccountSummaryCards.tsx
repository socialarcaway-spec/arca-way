import { useState } from 'react';
import { BankAccount } from '@/lib/account-types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Wallet,
  Building2,
  Globe,
  Eye,
  EyeOff,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountSummaryCardsProps {
  accounts: BankAccount[];
  isLoading?: boolean;
}

export function AccountSummaryCards({ accounts, isLoading }: AccountSummaryCardsProps) {
  const [showValues, setShowValues] = useState(true);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="size-9 rounded-xl" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-36" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate totals
  // Exclusively sum actual available balances (NO credit limit, NO overdraft)
  const totalBalanceCents = accounts.reduce((sum, acc) => sum + (acc.saldo || 0), 0);
  const manualAccountsCount = accounts.filter((a) => a.origem === 'manual').length;
  const openFinanceAccountsCount = accounts.filter((a) => a.origem === 'open_finance').length;
  const totalAccounts = accounts.length;

  const openFinanceBalanceCents = accounts
    .filter((a) => a.origem === 'open_finance')
    .reduce((sum, acc) => sum + (acc.saldo || 0), 0);

  const manualBalanceCents = accounts
    .filter((a) => a.origem === 'manual')
    .reduce((sum, acc) => sum + (acc.saldo || 0), 0);

  const formatBRL = (cents: number) => {
    if (!showValues) return '••••••••';
    const val = cents / 100;
    return `${val < 0 ? '-' : ''}R$ ${Math.abs(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-3">
      {/* Privacy Toggle Row */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowValues(!showValues)}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5 rounded-lg"
          title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
        >
          {showValues ? (
            <>
              <EyeOff className="size-3.5" />
              <span>Ocultar saldos</span>
            </>
          ) : (
            <>
              <Eye className="size-3.5" />
              <span>Exibir saldos</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Saldo Disponível Total */}
        <article className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card p-5 shadow-xs transition-all hover:border-primary/60">
          <div className="flex items-center justify-between">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-xs">
              <Wallet className="size-4" />
            </span>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
              Consolidado
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Saldo disponível
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatBRL(totalBalanceCents)}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-500" />
            Recursos líquidos em {totalAccounts} {totalAccounts === 1 ? 'conta' : 'contas'}
          </p>
        </article>

        {/* Card 2: Contas Cadastradas */}
        <article className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-secondary text-foreground shadow-xs">
              <Building2 className="size-4" />
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Total {totalAccounts}
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Contas cadastradas
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {totalAccounts}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              {totalAccounts === 1 ? 'instituição' : 'instituições'}
            </span>
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {manualAccountsCount} manuais · {openFinanceAccountsCount} Open Finance
          </p>
        </article>

        {/* Card 3: Open Finance Sincronizado */}
        <article className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 shadow-xs">
              <Globe className="size-4" />
            </span>
            <span className="text-[11px] font-medium text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-md">
              Automático
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Sincronizado Open Finance
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatBRL(openFinanceBalanceCents)}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {openFinanceAccountsCount} {openFinanceAccountsCount === 1 ? 'conta conectada' : 'contas conectadas'}
          </p>
        </article>

        {/* Card 4: Contas Manuais / Físicas */}
        <article className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-xs">
              <TrendingUp className="size-4" />
            </span>
            <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Manual
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Saldo em contas manuais
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatBRL(manualBalanceCents)}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {manualAccountsCount} {manualAccountsCount === 1 ? 'conta manual' : 'contas manuais'}
          </p>
        </article>
      </div>
    </div>
  );
}
