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
import { BankAccount, AddTransactionData } from '@/lib/account-types';
import { useAddAccountTransaction } from '@/hooks/use-accounts';
import { PlusCircle, Loader2, ArrowUpRight, ArrowDownRight, SlidersHorizontal } from 'lucide-react';

interface AccountTransactionModalProps {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  'Geral',
  'Alimentação',
  'Transporte',
  'Moradia',
  'Serviços',
  'Lazer',
  'Saúde',
  'Salário',
  'Investimentos',
  'Outros',
];

export function AccountTransactionModal({
  account,
  open,
  onOpenChange,
}: AccountTransactionModalProps) {
  const [tipo, setTipo] = useState<'receita' | 'despesa' | 'ajuste_saldo'>('despesa');
  const [valorText, setValorText] = useState('0,00');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const addTxMutation = useAddAccountTransaction();

  useEffect(() => {
    if (open) {
      setTipo('despesa');
      setValorText('0,00');
      setDescricao('');
      setCategoria(CATEGORIES[0]);
      setData(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  if (!account) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseValorCents(valorText);
    if (cents <= 0 || !descricao.trim()) return;

    const payload: AddTransactionData = {
      contaId: account.id,
      tipo,
      valorCents: cents,
      descricao: descricao.trim(),
      categoria,
      data,
    };

    await addTxMutation.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-border bg-card p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <PlusCircle className="size-5 text-primary" />
            Adicionar Movimentação
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lançamento em <strong>{account.nome}</strong>. O saldo será atualizado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tipo de Movimentação Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Tipo da movimentação *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipo('despesa')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  tipo === 'despesa'
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownRight className="size-3.5" />
                Despesa (-)
              </button>

              <button
                type="button"
                onClick={() => setTipo('receita')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  tipo === 'receita'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="size-3.5" />
                Receita (+)
              </button>

              <button
                type="button"
                onClick={() => setTipo('ajuste_saldo')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  tipo === 'ajuste_saldo'
                    ? 'border-primary/50 bg-primary-soft text-primary shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal className="size-3.5" />
                Ajuste
              </button>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-1.5">
            <Label htmlFor="txValor" className="text-xs font-semibold text-foreground">
              Valor *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                R$
              </span>
              <Input
                id="txValor"
                value={valorText}
                onChange={handleValorChange}
                className="h-10 text-xs pl-9 font-semibold bg-background border-border text-foreground"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="txDesc" className="text-xs font-semibold text-foreground">
              Descrição *
            </Label>
            <Input
              id="txDesc"
              placeholder="Ex: Compra farmácia, Salário, Pix recebido..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="h-10 text-xs bg-background border-border text-foreground"
              required
            />
          </div>

          {/* Grid Categoria e Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="h-10 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="txData" className="text-xs font-semibold text-foreground">
                Data *
              </Label>
              <Input
                id="txData"
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
              disabled={addTxMutation.isPending}
              className="text-xs h-9 border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addTxMutation.isPending || parseValorCents(valorText) <= 0 || !descricao.trim()}
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {addTxMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Salvando...
                </>
              ) : (
                'Salvar movimentação'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
