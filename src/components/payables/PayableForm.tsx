import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PlusCircle,
  Loader2,
  CalendarCheck2,
  Repeat,
  Layers,
  FileText,
  Info,
} from 'lucide-react';
import {
  Payable,
  PayableFormData,
  PayableStatus,
  RecurrenceFrequency,
  AccountType,
  PAYABLE_CATEGORIES,
} from '@/lib/payable-types';
import { useCreatePayable, useUpdatePayable } from '@/hooks/use-payables';

interface PayableFormProps {
  payableToEdit?: Payable | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  defaultMonth?: number;
  defaultYear?: number;
}

const PAYMENT_METHODS = [
  'Boleto',
  'Pix',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Débito Automático',
  'Dinheiro',
  'Transferência',
  'Outros',
];

export function PayableForm({
  payableToEdit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  triggerButton,
  defaultMonth,
  defaultYear,
}: PayableFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const createMutation = useCreatePayable();
  const updateMutation = useUpdatePayable();

  // Form State
  const [accountType, setAccountType] = useState<AccountType>('recorrente');
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [categoria, setCategoria] = useState(PAYABLE_CATEGORIES[0]);
  const [formaPagamento, setFormaPagamento] = useState(PAYMENT_METHODS[0]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [status, setStatus] = useState<PayableStatus>('Pendente');
  const [observacao, setObservacao] = useState('');

  // Recorrência
  const [frequencia, setFrequencia] = useState<RecurrenceFrequency>('Mensal');

  // Parcelamento
  const [totalParcelas, setTotalParcelas] = useState('2');

  const now = new Date();
  const defM = defaultMonth || now.getMonth() + 1;
  const defY = defaultYear || now.getFullYear();
  const initialDateStr = `${defY}-${String(defM).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (payableToEdit) {
      setDescricao(payableToEdit.descricao);
      setValorDisplay((payableToEdit.valor / 100).toFixed(2).replace('.', ','));
      setCategoria(
        PAYABLE_CATEGORIES.includes(payableToEdit.categoria as any)
          ? (payableToEdit.categoria as any)
          : PAYABLE_CATEGORIES[0]
      );
      setFormaPagamento(payableToEdit.formaPagamento);
      setDataVencimento(payableToEdit.dataVencimento);
      setStatus(payableToEdit.status);
      setObservacao(payableToEdit.observacao || '');

      if (payableToEdit.parcelado) {
        setAccountType('parcelada');
        setTotalParcelas(String(payableToEdit.totalParcelas || 2));
      } else if (payableToEdit.recorrente) {
        setAccountType('recorrente');
        setFrequencia(payableToEdit.frequenciaRecorrencia || 'Mensal');
      } else {
        setAccountType('unica');
      }
    } else {
      resetForm();
    }
  }, [payableToEdit, open]);

  const resetForm = () => {
    setAccountType('recorrente');
    setDescricao('');
    setValorDisplay('');
    setCategoria(PAYABLE_CATEGORIES[0]);
    setFormaPagamento(PAYMENT_METHODS[0]);
    setDataVencimento(initialDateStr);
    setStatus('Pendente');
    setObservacao('');
    setFrequencia('Mensal');
    setTotalParcelas('2');
  };

  const parseCents = (valStr: string) => {
    const clean = valStr.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const parsedCents = parseCents(valorDisplay);
  const numParcelas = Math.max(2, parseInt(totalParcelas, 10) || 2);
  const valorParcelaCents =
    accountType === 'parcelada' ? Math.floor(parsedCents / numParcelas) : parsedCents;

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || parsedCents <= 0 || !dataVencimento) return;

    const isParcelada = accountType === 'parcelada';
    const isRecorrente = accountType === 'recorrente';

    const payload: PayableFormData = {
      descricao: descricao.trim(),
      valor: parsedCents,
      categoria,
      formaPagamento,
      dataVencimento,
      status,
      observacao: observacao.trim() || undefined,
      accountType,
      parcelado: isParcelada,
      totalParcelas: isParcelada ? numParcelas : undefined,
      recorrente: isRecorrente,
      frequenciaRecorrencia: isRecorrente ? frequencia : undefined,
    };

    if (payableToEdit) {
      await updateMutation.mutateAsync({
        id: payableToEdit.id,
        data: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setOpen(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton ? (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 rounded-xl shadow-xs">
            <PlusCircle className="size-4" />
            Nova conta
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarCheck2 className="size-5 text-primary" />
            {payableToEdit ? 'Editar Conta Mensal' : 'Cadastrar Conta Mensal'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {payableToEdit
              ? 'Atualize os dados deste compromisso financeiro.'
              : 'Cadastre suas contas fixas, recorrentes ou parceladas do mês.'}
          </DialogDescription>
        </DialogHeader>

        {/* Informative Note regarding Daily Expenses */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/60 text-[11px] text-muted-foreground">
          <Info className="size-4 shrink-0 text-primary mt-0.5" />
          <span>
            <strong>Compromissos Mensais:</strong> Use para aluguel, luz, internet, financiamentos, seguros e parcelas. Gastos diários (mercado, lanche, combustível) pertencem ao módulo de Despesas Diárias.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Seletor de Tipo de Conta (Única, Recorrente, Parcelada) */}
          {!payableToEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Tipo de Conta *
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('unica')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    accountType === 'unica'
                      ? 'border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="size-4 mb-1" />
                  Conta única
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('recorrente')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    accountType === 'recorrente'
                      ? 'border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Repeat className="size-4 mb-1" />
                  Conta recorrente
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('parcelada')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    accountType === 'parcelada'
                      ? 'border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="size-4 mb-1" />
                  Conta parcelada
                </button>
              </div>
            </div>
          )}

          {/* Nome da Conta */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
              Nome da conta *
            </Label>
            <Input
              id="desc"
              required
              placeholder="Ex: Aluguel, Internet Fibra, Energia Enel, Financiamento..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-background border-border text-foreground text-xs h-9"
            />
          </div>

          {/* Valor e Data de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold text-foreground">
                {accountType === 'parcelada' ? 'Valor Total da Compra (R$) *' : 'Valor (R$) *'}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-semibold text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valor"
                  required
                  placeholder="0,00"
                  value={valorDisplay}
                  onChange={(e) => setValorDisplay(e.target.value)}
                  className="pl-9 bg-background border-border text-foreground font-semibold text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vencimento" className="text-xs font-semibold text-foreground">
                {accountType === 'parcelada'
                  ? 'Primeiro Vencimento *'
                  : 'Data de Vencimento *'}
              </Label>
              <Input
                id="vencimento"
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="bg-background border-border text-foreground text-xs h-9"
              />
            </div>
          </div>

          {/* Seção Condicional: Conta Recorrente */}
          {accountType === 'recorrente' && !payableToEdit && (
            <div className="p-3 rounded-xl border border-primary/20 bg-primary-soft/40 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Repeat className="size-3.5 text-primary" /> Frequência da Recorrência
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  Repetida automaticamente
                </span>
              </div>
              <Select
                value={frequencia}
                onValueChange={(val) => setFrequencia(val as RecurrenceFrequency)}
              >
                <SelectTrigger className="bg-background border-border text-foreground h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Mensal" className="text-xs">
                    Mensal (Todo mês)
                  </SelectItem>
                  <SelectItem value="Semanal" className="text-xs">
                    Semanal (A cada 7 dias)
                  </SelectItem>
                  <SelectItem value="Quinzenal" className="text-xs">
                    Quinzenal (A cada 15 dias)
                  </SelectItem>
                  <SelectItem value="Anual" className="text-xs">
                    Anual (Uma vez por ano)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seção Condicional: Conta Parcelada */}
          {accountType === 'parcelada' && !payableToEdit && (
            <div className="p-3.5 rounded-xl border border-primary/30 bg-primary-soft/40 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" /> Detalhes do Parcelamento
                </Label>
                <span className="text-[10px] text-primary font-medium">
                  Divisão matemática exata
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-foreground">
                    Quantidade de parcelas
                  </Label>
                  <Select value={totalParcelas} onValueChange={setTotalParcelas}>
                    <SelectTrigger className="bg-background border-border text-foreground h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border max-h-48">
                      {Array.from({ length: 47 }, (_, i) => i + 2).map((num) => (
                        <SelectItem key={num} value={String(num)} className="text-xs">
                          {num}x parcelas
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <span className="text-[11px] text-muted-foreground">
                    Valor por parcela no mês:
                  </span>
                  <div className="text-sm font-bold text-primary">
                    {formatBRL(valorParcelaCents)}
                  </div>
                </div>
              </div>

              {parsedCents > 0 && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Cada mês contabilizará somente {formatBRL(valorParcelaCents)}. Nunca o valor total.
                </p>
              )}
            </div>
          )}

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-9">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-52">
                  {PAYABLE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Forma de Pagamento *</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-9">
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-52">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method} className="text-xs">
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Inicial */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Status Inicial</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={status === 'Pendente' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('Pendente')}
                className={`h-8 text-xs font-medium ${
                  status === 'Pendente'
                    ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                Pendente
              </Button>
              <Button
                type="button"
                variant={status === 'Pago' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('Pago')}
                className={`h-8 text-xs font-medium ${
                  status === 'Pago'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                Pago
              </Button>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="obs" className="text-xs font-semibold text-foreground">
              Observação (opcional)
            </Label>
            <Textarea
              id="obs"
              placeholder="Ex: Código de barras, número da apólice, contrato..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="bg-background border-border text-foreground text-xs resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="text-xs h-9 border-border text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !descricao.trim() || parsedCents <= 0}
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Salvando...
                </>
              ) : payableToEdit ? (
                'Salvar alterações'
              ) : (
                'Cadastrar conta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
