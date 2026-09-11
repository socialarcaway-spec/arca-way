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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BankAccount,
  CreateAccountFormData,
  AccountType,
  ACCOUNT_TYPES_LABELS,
  KNOWN_INSTITUTIONS,
  PRESET_COLORS,
} from '@/lib/account-types';
import { useCreateAccount, useUpdateAccount } from '@/hooks/use-accounts';
import { Loader2, Landmark, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface ManualAccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: BankAccount | null;
}

export function ManualAccountFormModal({
  open,
  onOpenChange,
  accountToEdit,
}: ManualAccountFormModalProps) {
  const isEditing = Boolean(accountToEdit);
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  // Form states
  const [selectedInstKey, setSelectedInstKey] = useState<string>('nubank');
  const [customInstName, setCustomInstName] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [tipo, setTipo] = useState<AccountType>('corrente');
  const [saldoText, setSaldoText] = useState<string>('0,00');

  // Optional fields
  const [showOptional, setShowOptional] = useState<boolean>(false);
  const [agencia, setAgencia] = useState<string>('');
  const [numeroConta, setNumeroConta] = useState<string>('');
  const [digito, setDigito] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');

  // Customization
  const [cor, setCor] = useState<string>('#820AD1');

  useEffect(() => {
    if (accountToEdit) {
      const matchInst = KNOWN_INSTITUTIONS.find(
        (i) => i.key === accountToEdit.instituicaoKey || i.nome.toLowerCase() === accountToEdit.instituicao.toLowerCase()
      );
      setSelectedInstKey(matchInst ? matchInst.key : 'outro');
      setCustomInstName(matchInst ? '' : accountToEdit.instituicao);
      setNome(accountToEdit.nome);
      setTipo(accountToEdit.tipo);
      setSaldoText((accountToEdit.saldo / 100).toFixed(2).replace('.', ','));
      setAgencia(accountToEdit.agencia || '');
      setNumeroConta(accountToEdit.numeroConta?.replace(/\D/g, '') || '');
      setDigito(accountToEdit.digito || '');
      setObservacao(accountToEdit.observacao || '');
      setCor(accountToEdit.cor || '#820AD1');
      if (accountToEdit.agencia || accountToEdit.numeroConta || accountToEdit.observacao) {
        setShowOptional(true);
      }
    } else {
      resetForm();
    }
  }, [accountToEdit, open]);

  const resetForm = () => {
    setSelectedInstKey('nubank');
    setCustomInstName('');
    setNome('');
    setTipo('corrente');
    setSaldoText('0,00');
    setAgencia('');
    setNumeroConta('');
    setDigito('');
    setObservacao('');
    setCor('#820AD1');
    setShowOptional(false);
  };

  const handleInstitutionChange = (key: string) => {
    setSelectedInstKey(key);
    const inst = KNOWN_INSTITUTIONS.find((i) => i.key === key);
    if (inst) {
      setCor(inst.cor);
      if (!nome || nome === 'Conta principal' || KNOWN_INSTITUTIONS.some((k) => `Conta ${k.nome}` === nome)) {
        setNome(`Conta ${inst.nome}`);
      }
    }
  };

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const cents = parseInt(raw, 10) || 0;
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    setSaldoText(formatted);
  };

  const parseSaldoCents = (val: string) => {
    const clean = val.replace(/[^\d]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const institutionObj = KNOWN_INSTITUTIONS.find((i) => i.key === selectedInstKey);
    const instituicaoNome =
      selectedInstKey === 'outro'
        ? customInstName.trim() || 'Outro banco'
        : institutionObj?.nome || 'Instituição';

    const payload: CreateAccountFormData = {
      nome: nome.trim() || `Conta ${instituicaoNome}`,
      instituicao: instituicaoNome,
      instituicaoKey: selectedInstKey,
      tipo,
      saldoInicialCents: parseSaldoCents(saldoText),
      agencia: agencia.trim() || undefined,
      numeroConta: numeroConta.trim() || undefined,
      digito: digito.trim() || undefined,
      observacao: observacao.trim() || undefined,
      cor,
    };

    if (isEditing && accountToEdit) {
      await updateMutation.mutateAsync({ id: accountToEdit.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border-border bg-card p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="size-5 text-primary" />
            {isEditing ? 'Editar Conta Bancária' : 'Cadastrar Conta Manual'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? 'Atualize os dados e personalizações desta conta.'
              : 'Informe a instituição, tipo e saldo inicial da sua conta bancária.'}
          </DialogDescription>
        </DialogHeader>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
          <span>
            <strong>Segurança em primeiro lugar:</strong> Nunca solicitamos senhas, números de cartão, tokens ou códigos de segurança (CVV).
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Instituição Financeira */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Instituição financeira *
            </Label>
            <Select value={selectedInstKey} onValueChange={handleInstitutionChange}>
              <SelectTrigger className="h-10 text-xs bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {KNOWN_INSTITUTIONS.map((inst) => (
                  <SelectItem key={inst.key} value={inst.key} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex size-3.5 rounded-full"
                        style={{ backgroundColor: inst.cor }}
                      />
                      <span>{inst.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Se escolheu "Outro banco", mostra campo com nome da instituição */}
          {selectedInstKey === 'outro' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="customInst" className="text-xs font-semibold text-foreground">
                Nome da instituição *
              </Label>
              <Input
                id="customInst"
                placeholder="Ex: Cooperativa de Crédito, Wise, Revolut..."
                value={customInstName}
                onChange={(e) => setCustomInstName(e.target.value)}
                className="h-10 text-xs bg-background border-border text-foreground"
                required
              />
            </div>
          )}

          {/* Nome da Conta */}
          <div className="space-y-1.5">
            <Label htmlFor="nomeConta" className="text-xs font-semibold text-foreground">
              Nome da conta *
            </Label>
            <Input
              id="nomeConta"
              placeholder="Ex: Conta principal, Conta Nubank, Conta salário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-10 text-xs bg-background border-border text-foreground"
              required
            />
          </div>

          {/* Grid: Tipo de Conta e Saldo Atual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Tipo da Conta */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Tipo da conta *
              </Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as AccountType)}>
                <SelectTrigger className="h-10 text-xs bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {Object.entries(ACCOUNT_TYPES_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Saldo Atual */}
            <div className="space-y-1.5">
              <Label htmlFor="saldoAtual" className="text-xs font-semibold text-foreground">
                {isEditing ? 'Saldo atual' : 'Saldo inicial'} *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  R$
                </span>
                <Input
                  id="saldoAtual"
                  value={saldoText}
                  onChange={handleSaldoChange}
                  className="h-10 text-xs pl-9 font-semibold bg-background border-border text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Cor de Identificação */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Cor de identificação
            </Label>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCor(preset)}
                  className={`size-6 rounded-full transition-transform cursor-pointer ${
                    cor === preset ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>

          {/* Dados Opcionais Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              {showOptional ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {showOptional ? 'Ocultar dados bancários opcionais' : '+ Adicionar agência, conta e observações (opcional)'}
            </button>
          </div>

          {/* Dados Opcionais Collapsible */}
          {showOptional && (
            <div className="space-y-3 p-3.5 rounded-xl bg-secondary/30 border border-border/60 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="agencia" className="text-[11px] text-muted-foreground">
                    Agência
                  </Label>
                  <Input
                    id="agencia"
                    placeholder="0001"
                    maxLength={6}
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    className="h-8 text-xs bg-background border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numConta" className="text-[11px] text-muted-foreground">
                    Nº Conta
                  </Label>
                  <Input
                    id="numConta"
                    placeholder="12345"
                    maxLength={12}
                    value={numeroConta}
                    onChange={(e) => setNumeroConta(e.target.value)}
                    className="h-8 text-xs bg-background border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="digito" className="text-[11px] text-muted-foreground">
                    Dígito
                  </Label>
                  <Input
                    id="digito"
                    placeholder="0"
                    maxLength={2}
                    value={digito}
                    onChange={(e) => setDigito(e.target.value)}
                    className="h-8 text-xs bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="obs" className="text-[11px] text-muted-foreground">
                  Observação
                </Label>
                <Textarea
                  id="obs"
                  placeholder="Ex: Conta usada exclusivamente para reservas de emergência..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="text-xs resize-none bg-background border-border"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs h-9 border-border text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Salvando...
                </>
              ) : isEditing ? (
                'Salvar alterações'
              ) : (
                'Salvar conta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
