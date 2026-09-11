import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReceivableSummary } from '@/lib/receivable-types';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReceivableMonthSummaryProps {
  summary?: ReceivableSummary;
  isLoading?: boolean;
}

export function ReceivableMonthSummary({ summary, isLoading }: ReceivableMonthSummaryProps) {
  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (isLoading || !summary) {
    return (
      <Card className="bg-card border-border/60 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const percent = Math.min(100, Math.max(0, summary.percentualRecebido));

  return (
    <Card className="bg-card border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Resumo de Recebimentos do Mês
          </CardTitle>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {percent}% Concluído
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Progresso da meta mensal</span>
            <span className="text-foreground">{formatBRL(summary.totalRecebido)} de {formatBRL(summary.totalPrevisto)}</span>
          </div>
          <Progress value={percent} className="h-3 bg-muted/60" />
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {/* Previsto */}
          <div className="p-3 bg-muted/30 rounded-xl border border-border/40 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              Previsto no Mês
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatBRL(summary.totalPrevisto)}
            </p>
          </div>

          {/* Recebido */}
          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-1">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Recebido
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatBRL(summary.totalRecebido)}
            </p>
          </div>

          {/* Falta Receber */}
          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-1">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Falta Receber
            </p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatBRL(summary.totalPendente)}
            </p>
          </div>

          {/* Em Atraso */}
          <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-1">
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Em Atraso
            </p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {formatBRL(summary.totalAtrasado)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
