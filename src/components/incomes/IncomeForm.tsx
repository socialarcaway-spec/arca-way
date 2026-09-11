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
import {
  IncomeFormData,
  IncomeRecord,
  IncomeStatus,
  RecurrenceFrequency,
} from '@/lib/income-types';
import { useCreateIncome, useUpdateIncome } from '@/hooks/use-incomes';

interface IncomeFormProps {
  incomeToEdit?: IncomeRecord | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  defaultMonth?: number;
  defaultYear?: number;
}

const CATEGORIES = [
  'Salário',
  'Freelance',
  'Vendas',
  'Serviços',
  'Investimentos',
  'Reembolso',
  'Outros',
];

const ORIGINS = [
  'Salário',
  'Freelance',
  'Cliente',
  'Venda',
  'Investimentos',
  'Reembolso',
  'Outros',
];

export function IncomeForm({
  incomeToEdit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  triggerButton,
  defaultMonth,
  defaultYear,
}: IncomeFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();

  // Form State
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [origem, setOrigem] = useState(ORIGINS[0]);
  const [data, setData] = useState('');
  const [status, setStatus] = useState<IncomeStatus>('Recebido');
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
    if (incomeToEdit) {
      setDescricao(incomeToEdit.descricao);
      setValorDisplay((incomeToEdit.valor / 100).toFixed(2).replace('.', ','));
      setCategoria(incomeToEdit.categoria || CATEGORIES[0]);
      setOrigem(incomeToEdit.origem || ORIGINS[0]);
      setData(incomeToEdit.dataPrevisao);
      setStatus(incomeToEdit.status === 'Recebido' ? 'Recebido' : 'Previsto');
      setObservacao(incomeToEdit.observacao || '');
      setIsRecorrente(Boolean(incomeToEdit.recorrente));
      setFrequencia(incomeToEdit.frequenciaRecorrencia || 'Mensal');
      setIsParcelado(Boolean(incomeToEdit.parcelado));
      setTotalParcelas(String(incomeToEdit.totalParcelas || 2));
    } else {
      resetForm();
    }
  }, [incomeToEdit, open]);

  const resetForm = () => {
    setDescricao('');
    setValorDisplay('');
    setCategoria(CATEGORIES[0]);
    setOrigem(ORIGINS[0]);
    setData(initialDateStr);
    setStatus('Recebido');
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
    if (!descricao.trim() || parsedCents <= 0 || !data) return;

    const payload: IncomeFormData = {
      descricao: descricao.trim(),
      valor: parsedCents,
      categoria,
      origem,
      data,
      status,
      observacao: observacao.trim() || undefined,
      recorrente: isParcelado ? false : isRecorrente,
      frequenciaRecorrencia: isParcelado ? undefined : isRecorrente ? frequencia : undefined,
      parcelado: isParcelado,
      totalParcelas: isParcelado ? numParcelas : undefined,
    };

    if (incomeToEdit) {
      await updateMutation.mutateAsync({
        id: incomeToEdit.id,
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
            Nova receita
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {incomeToEdit ? 'Editar Receita' : 'Cadastrar Nova Receita'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre entradas de salário, vendas, serviços ou rendimentos para alimentar seu fluxo de caixa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
              Descrição da Receita *
            </Label>
            <Input
              id="desc"
              required
              placeholder="Ex: Salário Mensal, Projeto Freelance, Venda de Produto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold text-foreground">
                {isParcelado ? 'Valor Total da Venda (R$) *' : 'Valor (R$) *'}
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
              <Label htmlFor="data" className="text-xs font-semibold text-foreground">
                {isParcelado ? '1ª Data de Recebimento *' : 'Data do Recebimento/Previsão *'}
              </Label>
              <Input
                id="data"
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          {/* Categoria e Origem */}
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
              <Label className="text-xs font-semibold text-foreground">Origem / Fonte *</Label>
              <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ORIGINS.map((ori) => (
                    <SelectItem key={ori} value={ori}>
                      {ori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Inicial */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Status do Recebimento</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={status === 'Recebido' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('Recebido')}
                className={`flex-1 ${status === 'Recebido' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold' : ''}`}
              >
                Recebido
              </Button>
              <Button
                type="button"
                variant={status === 'Previsto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('Previsto')}
                className={`flex-1 ${status === 'Previsto' ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold' : ''}`}
              >
                Previsto
              </Button>
            </div>
          </div>

          {/* Parcelamento Switch & Options */}
          {!incomeToEdit && (
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">Receita parcelada?</div>
                  <div className="text-[11px] text-muted-foreground">
                    Ex: Venda de R$ 1.200 em 6x gera R$ 200/mês distribuído mês a mês
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
                        {Array.from({ length: 35 }, (_, i) => i + 2).map((num) => (
                          <SelectItem key={num} value={String(num)} className="text-xs">
                            {num}x parcelas
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-end">
                    <div className="text-[11px] text-muted-foreground">Valor por mês:</div>
                    <div className="text-xs font-bold text-primary">
                      {numParcelas}x de {formatBRLPreview(valorParcelaCents)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recorrência Switch & Options */}
          {!incomeToEdit && !isParcelado && (
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">Receita recorrente?</div>
                  <div className="text-[11px] text-muted-foreground">
                    Para entradas regulares como salário todo dia 5 ou contratos mensais
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
              placeholder="Detalhes sobre o cliente, contrato, pagamento..."
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
              ) : incomeToEdit ? (
                'Atualizar receita'
              ) : (
                'Cadastrar receita'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
