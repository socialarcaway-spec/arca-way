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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BankAccount, TransferFundsData } from '@/lib/account-types';
import { useTransferFunds } from '@/hooks/use-accounts';
import { ArrowLeftRight, Loader2, Info, ArrowRight } from 'lucide-react';

interface TransferModalProps {
  accounts: BankAccount[];
  defaultOrigemId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferModal({
  accounts,
  defaultOrigemId,
  open,
  onOpenChange,
}: TransferModalProps) {
  const [origemId, setOrigemId] = useState<string>('');
  const [destinoId, setDestinoId] = useState<string>('');
  const [valorText, setValorText] = useState('0,00');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const transferMutation = useTransferFunds();

  useEffect(() => {
    if (open) {
      const orig = defaultOrigemId || accounts[0]?.id || '';
      setOrigemId(orig);
      const dest = accounts.find((a) => a.id !== orig)?.id || '';
      setDestinoId(dest);
      setValorText('0,00');
      setDescricao('Transferência entre contas');
      setData(new Date().toISOString().split('T')[0]);
    }
  }, [open, defaultOrigemId, accounts]);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const cents = parseInt(raw, 10) || 0;
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    setValorText(formatted);
  };

  const parseValorCents = (val: string) => {
    const clean = val.replace(/[^\d]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const contaOrigem = accounts.find((a) => a.id === origemId);
  const contaDestino = accounts.find((a) => a.id === destinoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseValorCents(valorText);
    if (!origemId || !destinoId || origemId === destinoId || cents <= 0) return;

    const payload: TransferFundsData = {
      contaOrigemId: origemId,
      contaDestinoId: destinoId,
      valorCents: cents,
      data,
      descricao: descricao.trim() || 'Transferência interna',
    };

    await transferMutation.mutateAsync(payload);
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
      <DialogContent className="sm:max-w-[500px] border-border bg-card p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <ArrowLeftRight className="size-5 text-primary" />
            Transferência entre Contas
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Mova recursos entre suas próprias contas sem impactar suas despesas ou receitas globais.
          </DialogDescription>
        </DialogHeader>

        {/* Informative Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/60 text-[11px] text-muted-foreground">
          <Info className="size-4 shrink-0 text-primary mt-0.5" />
          <span>
            <strong>Movimentação de patrimônio:</strong> O valor debitado na conta de origem é creditado na conta de destino, preservando seu saldo total disponível.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Visual transfer flow (Origem -> Destino) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* De: Conta Origem */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                De (Origem) *
              </Label>
              <Select value={origemId} onValueChange={setOrigemId}>
                <SelectTrigger className="h-10 text-xs bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="text-xs">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>{acc.nome}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({formatBRL(acc.saldo)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Para: Conta Destino */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Para (Destino) *
              </Label>
              <Select value={destinoId} onValueChange={setDestinoId}>
                <SelectTrigger className="h-10 text-xs bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione o destino" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {accounts
                    .filter((a) => a.id !== origemId)
                    .map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} className="text-xs">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span>{acc.nome}</span>
                          <span className="text-[10px] text-muted-foreground">
                            ({formatBRL(acc.saldo)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor da Transferência */}
          <div className="space-y-1.5">
            <Label htmlFor="trfValor" className="text-xs font-semibold text-foreground">
              Valor da transferência *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                R$
              </span>
              <Input
                id="trfValor"
                value={valorText}
                onChange={handleValorChange}
                className="h-10 text-xs pl-9 font-semibold bg-background border-border text-foreground"
              />
            </div>
          </div>

          {/* Preview of impact */}
          {contaOrigem && contaDestino && parseValorCents(valorText) > 0 && (
            <div className="p-3 rounded-xl border border-border bg-secondary/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{contaOrigem.nome}:</span>
                <span className="font-semibold text-rose-500">
                  - {formatBRL(parseValorCents(valorText))}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{contaDestino.nome}:</span>
                <span className="font-semibold text-emerald-500">
                  + {formatBRL(parseValorCents(valorText))}
                </span>
              </div>
            </div>
          )}

          {/* Descrição e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trfDesc" className="text-xs font-semibold text-foreground">
                Descrição
              </Label>
              <Input
                id="trfDesc"
                placeholder="Ex: Reserva, Pix para despesas..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="h-10 text-xs bg-background border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trfData" className="text-xs font-semibold text-foreground">
                Data *
              </Label>
              <Input
                id="trfData"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-10 text-xs bg-background border-border text-foreground"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={transferMutation.isPending}
              className="text-xs h-9 border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                transferMutation.isPending ||
                !origemId ||
                !destinoId ||
                origemId === destinoId ||
                parseValorCents(valorText) <= 0
              }
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Transferindo...
                </>
              ) : (
                'Confirmar transferência'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
