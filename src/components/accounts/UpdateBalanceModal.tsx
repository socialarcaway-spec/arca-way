import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BankAccount } from '@/lib/account-types';
import { useUpdateAccountBalance } from '@/hooks/use-accounts';
import { RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface UpdateBalanceModalProps {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateBalanceModal({
  account,
  open,
  onOpenChange,
}: UpdateBalanceModalProps) {
  const [novoSaldoText, setNovoSaldoText] = useState('0,00');
  const [motivo, setMotivo] = useState('');

  const updateMutation = useUpdateAccountBalance();

  useEffect(() => {
    if (account) {
      setNovoSaldoText((account.saldo / 100).toFixed(2).replace('.', ','));
      setMotivo('');
    }
  }, [account, open]);

  if (!account) return null;

  const currentCents = account.saldo;
  const parseSaldoCents = (val: string) => {
    const clean = val.replace(/[^\d]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const newCents = parseSaldoCents(novoSaldoText);
  const diffCents = newCents - currentCents;

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const cents = parseInt(raw, 10) || 0;
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    setNovoSaldoText(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      contaId: account.id,
      novoSaldoCents: newCents,
      observacao: motivo.trim() || undefined,
    });
    onOpenChange(false);
  };

  const formatBRL = (cents: number) => {
    const val = cents / 100;
    return `${val < 0 ? '-' : ''}R$ ${Math.abs(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] border-border bg-card p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <RefreshCw className="size-5 text-primary" />
            Atualizar Saldo Manual
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ajuste o saldo atual da conta <strong>{account.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Visual comparison */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-secondary/30">
            <div>
              <span className="text-[11px] text-muted-foreground block">
                Saldo atual:
              </span>
              <span className="text-sm font-bold text-foreground">
                {formatBRL(currentCents)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">
                Novo saldo:
              </span>
              <span className="text-sm font-bold text-primary">
                {formatBRL(newCents)}
              </span>
            </div>
          </div>

          {diffCents !== 0 && (
            <div className="text-xs px-1 text-muted-foreground flex items-center gap-1.5">
              <span>Diferença:</span>
              <span
                className={`font-semibold ${
                  diffCents > 0
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                }`}
              >
                {diffCents > 0 ? '+' : ''}
                {formatBRL(diffCents)}
              </span>
            </div>
          )}

          {/* Input: Novo Saldo */}
          <div className="space-y-1.5">
            <Label htmlFor="novoSaldo" className="text-xs font-semibold text-foreground">
              Digite o novo saldo *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                R$
              </span>
              <Input
                id="novoSaldo"
                value={novoSaldoText}
                onChange={handleSaldoChange}
                className="h-10 text-xs pl-9 font-semibold bg-background border-border text-foreground"
                autoFocus
              />
            </div>
          </div>

          {/* Motivo Opcional */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo" className="text-xs font-semibold text-foreground">
              Motivo do ajuste (opcional)
            </Label>
            <Textarea
              id="motivo"
              placeholder="Ex: Conciliação com extrato bancário, rendimentos, juros..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="text-xs resize-none bg-background border-border"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="text-xs h-9 border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Atualizando...
                </>
              ) : (
                'Confirmar novo saldo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
