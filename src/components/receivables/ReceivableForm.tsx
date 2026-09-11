import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { Plus, Pencil, Loader2, DollarSign } from 'lucide-react';
import {
  Receivable,
  ReceivableFormData,
  ReceivableStatus,
  RecurrenceFrequency,
} from '@/lib/receivable-types';
import { useCreateReceivable, useUpdateReceivable } from '@/hooks/use-receivables';

interface ReceivableFormProps {
  receivable?: Receivable | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  'Empréstimo',
  'Outros',
];

export function ReceivableForm({
  receivable,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ReceivableFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (externalOnOpenChange) externalOnOpenChange(val);
    setInternalOpen(val);
  };

  const isEditing = Boolean(receivable);

  const createMutation = useCreateReceivable();
  const updateMutation = useUpdateReceivable();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [descricao, setDescricao] = useState('');
  const [valorText, setValorText] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [origem, setOrigem] = useState(ORIGINS[0]);
  const [dataPrevisao, setDataPrevisao] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [observacao, setObservacao] = useState('');
  const [status, setStatus] = useState<ReceivableStatus>('Pendente');

  const [recorrente, setRecorrente] = useState(false);
  const [frequenciaRecorrencia, setFrequenciaRecorrencia] =
    useState<RecurrenceFrequency>('Mensal');

  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState('2');

  useEffect(() => {
    if (receivable) {
      setDescricao(receivable.descricao || '');
      setValorText((receivable.valor / 100).toFixed(2).replace('.', ','));
      setCategoria(receivable.categoria || CATEGORIES[0]);
      setOrigem(receivable.origem || ORIGINS[0]);
      setDataPrevisao(receivable.dataPrevisao || new Date().toISOString().split('T')[0]);
      setObservacao(receivable.observacao || '');
      setStatus(receivable.status || 'Pendente');
      setRecorrente(receivable.recorrente || false);
      setFrequenciaRecorrencia(receivable.frequenciaRecorrencia || 'Mensal');
      setParcelado(receivable.parcelado || false);
      setTotalParcelas(receivable.totalParcelas ? String(receivable.totalParcelas) : '2');
    } else {
      setDescricao('');
      setValorText('');
      setCategoria(CATEGORIES[0]);
      setOrigem(ORIGINS[0]);
      setDataPrevisao(new Date().toISOString().split('T')[0]);
      setObservacao('');
      setStatus('Pendente');
      setRecorrente(false);
      setFrequenciaRecorrencia('Mensal');
      setParcelado(false);
      setTotalParcelas('2');
    }
  }, [receivable, isOpen]);

  const parseValorCents = (text: string): number => {
    if (!text) return 0;
    const clean = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const float = parseFloat(clean);
    return isNaN(float) ? 0 : Math.round(float * 100);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Format input live
    val = val.replace(/[^\d.,]/g, '');
    setValorText(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valorCents = parseValorCents(valorText);
    if (!descricao.trim()) return;
    if (valorCents <= 0) return;

    const payload: ReceivableFormData = {
      descricao: descricao.trim(),
      valor: valorCents,
      categoria,
      origem,
      dataPrevisao,
      status,
      observacao: observacao.trim() || undefined,
      recorrente,
      frequenciaRecorrencia: recorrente ? frequenciaRecorrencia : undefined,
      parcelado,
      totalParcelas: parcelado ? Math.max(2, parseInt(totalParcelas, 10) || 2) : 1,
    };

    if (isEditing && receivable) {
      await updateMutation.mutateAsync({ id: receivable.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    setOpen(false);
  };

  // Live calculation of installment value for visual feedback
  const valorCentsCurrent = parseValorCents(valorText);
  const totalNum = parseInt(totalParcelas, 10) || 1;
  const installmentCents = parcelado && totalNum > 0 ? Math.floor(valorCentsCurrent / totalNum) : valorCentsCurrent;
  const installmentFormatted = (installmentCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !externalOpen ? (
        <DialogTrigger asChild>
          <Button className="gap-2 font-medium shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            Nova Conta a Receber
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? (
              <>
                <Pencil className="w-5 h-5 text-emerald-500" /> Editar Conta a Receber
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 text-emerald-500" /> Nova Conta a Receber
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados da conta a receber selecionada.'
              : 'Cadastre um novo valor previsto para entrada em seu caixa.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="descricao"
              placeholder="Ex: Desenvolvimento de Website, Salário, Freela..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-sm font-medium">
                Valor Total (R$) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valor"
                  className="pl-9"
                  placeholder="0,00"
                  value={valorText}
                  onChange={handleValorChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dataPrevisao" className="text-sm font-medium">
                Data Prevista <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="dataPrevisao"
                type="date"
                value={dataPrevisao}
                onChange={(e) => setDataPrevisao(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Categoria + Origem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoria" className="text-sm font-medium">
                Categoria
              </Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="origem" className="text-sm font-medium">
                Origem
              </Label>
              <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger id="origem">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {ORIGINS.map((ori) => (
                    <SelectItem key={ori} value={ori}>
                      {ori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-medium">
              Status Inicial
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as ReceivableStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Parcial">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opções Avançadas: Recorrência & Parcelamento */}
          {!isEditing && (
            <div className="p-3 bg-muted/40 rounded-xl space-y-4 border border-border/50">
              {/* Recorrente */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recebimento Recorrente</p>
                  <p className="text-xs text-muted-foreground">
                    Repetir automaticamente periodicamente
                  </p>
                </div>
                <Switch
                  checked={recorrente}
                  onCheckedChange={(val) => {
                    setRecorrente(val);
                    if (val) setParcelado(false);
                  }}
                />
              </div>

              {recorrente && (
                <div className="pl-2 border-l-2 border-emerald-500/50 space-y-1.5">
                  <Label className="text-xs font-medium">Frequência</Label>
                  <Select
                    value={frequenciaRecorrencia}
                    onValueChange={(val) =>
                      setFrequenciaRecorrencia(val as RecurrenceFrequency)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Parcelado */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recebimento Parcelado</p>
                  <p className="text-xs text-muted-foreground">
                    Dividir valor em parcelas mensais
                  </p>
                </div>
                <Switch
                  checked={parcelado}
                  onCheckedChange={(val) => {
                    setParcelado(val);
                    if (val) setRecorrente(false);
                  }}
                />
              </div>

              {parcelado && (
                <div className="pl-2 border-l-2 border-emerald-500/50 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Nº de Parcelas</Label>
                    <Input
                      type="number"
                      min={2}
                      max={72}
                      className="h-8 text-xs w-24"
                      value={totalParcelas}
                      onChange={(e) => setTotalParcelas(e.target.value)}
                    />
                  </div>
                  {valorCentsCurrent > 0 && totalNum > 1 && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg font-medium">
                      Serão geradas {totalNum} parcelas de ~{installmentFormatted} nos meses subsequentes.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-sm font-medium">
              Observações / Detalhes
            </Label>
            <Textarea
              id="observacao"
              rows={2}
              placeholder="Anotações adicionais, contato do cliente, termos de pagamento..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !descricao || parseValorCents(valorText) <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
