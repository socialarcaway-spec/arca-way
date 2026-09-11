import { useState } from 'react';
import {
  useReconciliationSuggestions,
  useResolveReconciliation,
} from '@/hooks/use-accounts';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  GitMerge,
  Copy,
  CheckCircle2,
  Calendar,
  Loader2,
  Info,
} from 'lucide-react';
import { ReconciliationSuggestion } from '@/lib/account-types';

export function ReconciliationBanner() {
  const { data: suggestions = [], isLoading } = useReconciliationSuggestions();
  const resolveMutation = useResolveReconciliation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (isLoading || suggestions.length === 0) {
    return null;
  }

  const handleResolve = async (
    sug: ReconciliationSuggestion,
    action: 'keep_both' | 'merge'
  ) => {
    setProcessingId(sug.id);
    try {
      await resolveMutation.mutateAsync({
        manualTxId: sug.manualTransaction.id,
        openFinanceTxId: sug.openFinanceTransaction.id,
        action,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatBRL = (cents: number) => {
    const val = cents / 100;
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Possível movimentação duplicada detectada
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {suggestions.length} pendente{suggestions.length > 1 ? 's' : ''}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Identificamos lançamentos manuais com valor e data equivalentes a transações importadas via Open Finance.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((sug) => {
          const isProcessing = processingId === sug.id;
          const { manualTransaction: man, openFinanceTransaction: of } = sug;

          return (
            <div
              key={sug.id}
              className="p-3.5 rounded-xl border border-border bg-card/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Comparison Cards Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {/* Manual Item */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      Lançamento Manual
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {formatBRL(man.valor)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">
                    {man.descricao}
                  </p>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {man.data}
                    </span>
                    {man.categoria && <span>· {man.categoria}</span>}
                  </div>
                </div>

                {/* Open Finance Item */}
                <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded">
                      Open Finance Oficial
                    </span>
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {formatBRL(of.valor)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">
                    {of.descricao}
                  </p>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {of.data}
                    </span>
                    {of.categoria && <span>· {of.categoria}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleResolve(sug, 'keep_both')}
                  className="text-xs h-8 px-3 border-border hover:bg-secondary gap-1.5"
                >
                  <Copy className="size-3.5" />
                  Manter as duas
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleResolve(sug, 'merge')}
                  className="text-xs h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-xs"
                >
                  {isProcessing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <GitMerge className="size-3.5" />
                  )}
                  Mesclar movimentações
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
