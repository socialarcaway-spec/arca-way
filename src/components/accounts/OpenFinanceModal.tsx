import { useState } from 'react';
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
import {
  KNOWN_INSTITUTIONS,
  BankInstitution,
} from '@/lib/account-types';
import { useConnectOpenFinance } from '@/hooks/use-accounts';
import {
  Globe,
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  FileCheck2,
  Building2,
  AlertCircle,
} from 'lucide-react';

interface OpenFinanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'select_bank' | 'consent' | 'authorizing' | 'success';

export function OpenFinanceModal({ open, onOpenChange }: OpenFinanceModalProps) {
  const [step, setStep] = useState<Step>('select_bank');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankInstitution | null>(null);
  const [progressMsg, setProgressMsg] = useState('Iniciando conexão segura...');

  const connectMutation = useConnectOpenFinance();

  // Filter institutions that support Open Finance
  const availableBanks = KNOWN_INSTITUTIONS.filter(
    (b) =>
      b.suportaOpenFinance &&
      b.nome.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSelectBank = (bank: BankInstitution) => {
    setSelectedBank(bank);
    setStep('consent');
  };

  const handleStartAuthorization = async () => {
    if (!selectedBank) return;
    setStep('authorizing');
    setProgressMsg('Conectando ao canal seguro do banco...');

    try {
      setTimeout(() => {
        setProgressMsg(`Solicitando autorização em ${selectedBank.nome}...`);
      }, 700);

      setTimeout(() => {
        setProgressMsg('Importando contas e movimentações autorizadas...');
      }, 1400);

      await connectMutation.mutateAsync({
        institutionKey: selectedBank.key,
        nomeCustom: `${selectedBank.nome} Digital`,
      });

      setStep('success');
    } catch {
      setStep('consent');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after transition
    setTimeout(() => {
      setStep('select_bank');
      setSelectedBank(null);
      setSearchTerm('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto border-border bg-card p-6">
        {/* STEP 1: Select Bank */}
        {step === 'select_bank' && (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500">
                  <Globe className="size-4" />
                </span>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Conecte sua instituição
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Conecte suas contas através do Open Finance para visualizar saldos e movimentações automaticamente.
              </DialogDescription>
            </DialogHeader>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Pesquise seu banco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 text-xs pl-9 bg-background border-border text-foreground"
              />
            </div>

            {/* Bank Grid */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {availableBanks.map((bank) => (
                <button
                  key={bank.key}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-secondary/40 transition-all text-left group cursor-pointer"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: bank.cor, color: bank.corTexto }}
                  >
                    {bank.logoIniciais}
                  </span>
                  <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {bank.nome}
                  </span>
                </button>
              ))}

              {availableBanks.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  Nenhum banco encontrado com o termo "{searchTerm}".
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/60 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
              <span>
                O sistema <strong>nunca</strong> solicita nem armazena sua senha bancária.
              </span>
            </div>
          </>
        )}

        {/* STEP 2: Consent & Scope */}
        {step === 'consent' && selectedBank && (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="flex size-7 items-center justify-center rounded-lg text-xs font-bold"
                  style={{ backgroundColor: selectedBank.cor, color: selectedBank.corTexto }}
                >
                  {selectedBank.logoIniciais}
                </span>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  Autorizar compartilhamento com {selectedBank.nome}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Regulado pelo Banco Central do Brasil. Você tem controle total dos seus dados.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileCheck2 className="size-3.5 text-primary" />
                  Dados que serão compartilhados:
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc">
                  <li>Dados cadastrais básicos da conta (agência e número)</li>
                  <li>Saldo disponível em tempo real</li>
                  <li>Extrato e movimentações financeiras recentes</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-emerald-500" />
                  Privacidade e Segurança:
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A autenticação é realizada diretamente no ambiente seguro do <strong>{selectedBank.nome}</strong>. Você pode revogar essa autorização a qualquer momento.
                </p>
                <div className="text-[11px] text-primary font-medium">
                  Validade do consentimento: 12 meses
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep('select_bank')}
                className="text-xs h-9 border-border"
              >
                Voltar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleStartAuthorization}
                className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 gap-1.5"
              >
                Continuar para autorização
                <ArrowRight className="size-3.5" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* STEP 3: Authorizing Simulation */}
        {step === 'authorizing' && selectedBank && (
          <div className="py-10 text-center space-y-4">
            <div className="relative mx-auto flex size-16 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20 opacity-75" />
              <div
                className="relative flex size-14 items-center justify-center rounded-2xl shadow-md text-sm font-bold"
                style={{ backgroundColor: selectedBank.cor, color: selectedBank.corTexto }}
              >
                {selectedBank.logoIniciais}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Conectando via Open Finance
              </h3>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                {progressMsg}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Estabelecendo túnel criptografado e validando certificados com a instituição.
            </p>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && selectedBank && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Conta conectada com sucesso!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sua conta do <strong>{selectedBank.nome}</strong> foi sincronizada. Seus saldos e transações recentes já estão disponíveis.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-left text-xs space-y-1 max-w-md mx-auto">
              <div className="font-semibold text-foreground flex items-center justify-between">
                <span>{selectedBank.nome} Digital</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                  Open Finance • Conectado
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sincronização automática ativada.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={handleClose}
                className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                Ver minhas contas
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
