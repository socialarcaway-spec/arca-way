import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, Hash } from 'lucide-react';
import { ReceivableSummary } from '@/lib/receivable-types';
import { Skeleton } from '@/components/ui/skeleton';

interface ReceivableSummaryCardsProps {
  summary?: ReceivableSummary;
  isLoading?: boolean;
}

export function ReceivableSummaryCards({ summary, isLoading }: ReceivableSummaryCardsProps) {
  const formatBRL = (cents: number) => {
    const value = cents / 100;
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Previsto */}
      <Card className="bg-card border-border/60 shadow-sm hover:border-emerald-500/30 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total a Receber
          </CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <DollarSign className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">
            {formatBRL(summary.totalPrevisto)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.percentualRecebido}% recebido
          </p>
        </CardContent>
      </Card>

      {/* Recebido */}
      <Card className="bg-card border-border/60 shadow-sm hover:border-emerald-500/30 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recebido
          </CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatBRL(summary.totalRecebido)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.countRecebido} conta(s) quitadas
          </p>
        </CardContent>
      </Card>

      {/* Pendente */}
      <Card className="bg-card border-border/60 shadow-sm hover:border-amber-500/30 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Pendente
          </CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatBRL(summary.totalPendente)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.countPendente + summary.countParcial} conta(s) aguardando
          </p>
        </CardContent>
      </Card>

      {/* Atrasado */}
      <Card className="bg-card border-border/60 shadow-sm hover:border-rose-500/30 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Atrasado
          </CardTitle>
          <div className="p-2 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatBRL(summary.totalAtrasado)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.countAtrasado} conta(s) em atraso
          </p>
        </CardContent>
      </Card>

      {/* Quantidade */}
      <Card className="bg-card border-border/60 shadow-sm hover:border-indigo-500/30 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Registros
          </CardTitle>
          <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Hash className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">
            {summary.countTotal}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            no período selecionado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
