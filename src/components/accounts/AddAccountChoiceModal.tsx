import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PenTool, Globe, Shield, ArrowRight } from 'lucide-react';

interface AddAccountChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectManual: () => void;
  onSelectOpenFinance: () => void;
}

export function AddAccountChoiceModal({
  open,
  onOpenChange,
  onSelectManual,
  onSelectOpenFinance,
}: AddAccountChoiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Como deseja adicionar sua conta?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Escolha o método mais conveniente para gerenciar seus recursos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3.5 pt-3">
          {/* Opção 1: Manual */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onSelectManual();
            }}
            className="group relative flex items-start gap-4 p-4 rounded-2xl border border-border bg-background hover:border-primary/50 hover:bg-secondary/40 transition-all text-left shadow-xs cursor-pointer"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-transform group-hover:scale-105">
              <PenTool className="size-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Cadastrar manualmente
                </h4>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adicione os dados e o saldo da sua conta manualmente.
              </p>
            </div>
          </button>

          {/* Opção 2: Open Finance */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onSelectOpenFinance();
            }}
            className="group relative flex items-start gap-4 p-4 rounded-2xl border border-primary/30 bg-primary-soft/30 hover:border-primary/60 hover:bg-primary-soft/50 transition-all text-left shadow-xs cursor-pointer"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Globe className="size-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Conectar com Open Finance
                  </h4>
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                    Automático
                  </span>
                </div>
                <ArrowRight className="size-4 text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conecte seu banco e sincronize seus dados automaticamente.
              </p>
            </div>
          </button>
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/60 text-[11px] text-muted-foreground">
          <Shield className="size-4 shrink-0 text-emerald-500" />
          <span>
            Seus dados são protegidos. O sistema <strong>nunca</strong> solicita senhas, tokens ou códigos de segurança bancários.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
