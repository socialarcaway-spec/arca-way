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
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Payable, PayableFormData, PayableStatus, RecurrenceFrequency } from '@/lib/payable-types';
import { useCreatePayable, useUpdatePayable } from '@/hooks/use-payables';

interface PayableFormProps {
  payableToEdit?: Payable | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  defaultMonth?: number;
  defaultYear?: number;
}

const CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Assinaturas',
  'Serviços',
  'Impostos',
  'Outros',
];

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
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [formaPagamento, setFormaPagamento] = useState(PAYMENT_METHODS[0]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [status, setStatus] = useState<PayableStatus>('Pendente');
  const [observacao, setObservacao] = useState('');

  // Recorrência
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState<RecurrenceFrequency>('Mensal');

  // Parcelamento
  const [isParcelado, setIsParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState('2');

  const now = new Date();
  const defM = defaultMonth || now.getMonth() + 1;
  const defY = defaultYear || now.getFullYear();
  const initialDateStr = `${defY}-${String(defM).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (payableToEdit) {
      setDescricao(payableToEdit.descricao);
      setValorDisplay((payableToEdit.valor / 100).toFixed(2).replace('.', ','));
      setCategoria(payableToEdit.categoria);
      setFormaPagamento(payableToEdit.formaPagamento);
      setDataVencimento(payableToEdit.dataVencimento);
      setStatus(payableToEdit.status);
      setObservacao(payableToEdit.observacao || '');
      setIsRecorrente(Boolean(payableToEdit.recorrente));
      setFrequencia(payableToEdit.frequenciaRecorrencia || 'Mensal');
      setIsParcelado(Boolean(payableToEdit.parcelado));
      setTotalParcelas(String(payableToEdit.totalParcelas || 2));
    } else {
      resetForm();
    }
  }, [payableToEdit, open]);

  const resetForm = () => {
    setDescricao('');
    setValorDisplay('');
    setCategoria(CATEGORIES[0]);
    setFormaPagamento(PAYMENT_METHODS[0]);
    setDataVencimento(initialDateStr);
    setStatus('Pendente');
    setObservacao('');
    setIsRecorrente(false);
    setFrequencia('Mensal');
    setIsParcelado(false);
    setTotalParcelas('2');
  };

  const parseCents = (valStr: string) => {
    const clean = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const parsedCents = parseCents(valorDisplay);
  const numParcelas = Math.max(2, parseInt(totalParcelas) || 2);
  const valorParcelaCents = isParcelado ? Math.floor(parsedCents / numParcelas) : parsedCents;

  const formatBRLPreview = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || parsedCents <= 0 || !dataVencimento) return;

    const payload: PayableFormData = {
      descricao: descricao.trim(),
      valor: parsedCents,
      categoria,
      formaPagamento,
      dataVencimento,
      status,
      observacao: observacao.trim() || undefined,
      recorrente: isParcelado ? false : isRecorrente,
      frequenciaRecorrencia: isParcelado ? undefined : isRecorrente ? frequencia : undefined,
      parcelado: isParcelado,
      totalParcelas: isParcelado ? numParcelas : undefined,
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
    resetForm();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton !== undefined ? (
        triggerButton
      ) : (
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
            <PlusCircle className="size-4" />
            Nova conta
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {payableToEdit ? 'Editar Conta a Pagar' : 'Cadastrar Nova Conta a Pagar'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Preencha os detalhes da despesa ou compromisso para manter seu controle financeiro em dia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
              Descrição *
            </Label>
            <Input
              id="desc"
              required
              placeholder="Ex: Aluguel, Supermercado, Luz, Cartão..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Valor e Data de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold text-foreground">
                {isParcelado ? 'Valor Total da Compra (R$) *' : 'Valor (R$) *'}
              </Label>
              <Input
                id="valor"
                required
                placeholder="0,00"
                value={valorDisplay}
                onChange={(e) => setValorDisplay(e.target.value)}
                className="bg-background border-border text-foreground font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vencimento" className="text-xs font-semibold text-foreground">
                {isParcelado ? '1ª Data de Vencimento *' : 'Data de Vencimento *'}
              </Label>
              <Input
                id="vencimento"
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Forma de Pagamento *</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Inicial */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Status da Conta</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={status === 'Pendente' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('Pendente')}
                className={`flex-1 ${status === 'Pendente' ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' : ''}`}
              >
                Pendente
              </Button>
              <Button
                type="button"
                variant={status === 'Pago' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('Pago')}
                className={`flex-1 ${status === 'Pago' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold' : ''}`}
              >
                Pago
              </Button>
            </div>
          </div>

          {/* Parcelamento Switch & Options */}
          {!payableToEdit && (
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">É parcelada?</div>
                  <div className="text-[11px] text-muted-foreground">
                    Divida a compra em parcelas mensais que vencem a cada mês
                  </div>
                </div>
                <Switch
                  checked={isParcelado}
                  onCheckedChange={(checked) => {
                    setIsParcelado(checked);
                    if (checked) setIsRecorrente(false);
                  }}
                />
              </div>

              {isParcelado && (
                <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="text-[11px] text-muted-foreground">Valor por parcela:</div>
                    <div className="text-xs font-bold text-primary">
                      {numParcelas}x de {formatBRLPreview(valorParcelaCents)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recorrência Switch & Options */}
          {!payableToEdit && !isParcelado && (
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">É recorrente?</div>
                  <div className="text-[11px] text-muted-foreground">
                    Para contas periódicas como internet, aluguel ou assinaturas
                  </div>
                </div>
                <Switch
                  checked={isRecorrente}
                  onCheckedChange={(checked) => {
                    setIsRecorrente(checked);
                    if (checked) setIsParcelado(false);
                  }}
                />
              </div>

              {isRecorrente && (
                <div className="pt-2 border-t border-border/60">
                  <Label className="text-[11px] font-medium text-foreground">Frequência</Label>
                  <Select
                    value={frequencia}
                    onValueChange={(v) => setFrequencia(v as RecurrenceFrequency)}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="Mensal">Mensal (Padrão)</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="obs" className="text-xs font-semibold text-foreground">
              Observação (Opcional)
            </Label>
            <Textarea
              id="obs"
              rows={2}
              placeholder="Anotações adicionais, código de barras, detalhes..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="bg-background border-border text-foreground text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border-border text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || parsedCents <= 0 || !descricao.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Salvando...
                </>
              ) : payableToEdit ? (
                'Atualizar conta'
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
