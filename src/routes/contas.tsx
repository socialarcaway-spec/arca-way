import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BankAccount } from '@/lib/account-types';
import { useAccounts } from '@/hooks/use-accounts';

// Component imports
import { AccountSummaryCards } from '@/components/accounts/AccountSummaryCards';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AddAccountChoiceModal } from '@/components/accounts/AddAccountChoiceModal';
import { ManualAccountFormModal } from '@/components/accounts/ManualAccountFormModal';
import { OpenFinanceModal } from '@/components/accounts/OpenFinanceModal';
import { UpdateBalanceModal } from '@/components/accounts/UpdateBalanceModal';
import { AccountTransactionModal } from '@/components/accounts/AccountTransactionModal';
import { TransferModal } from '@/components/accounts/TransferModal';
import { AccountTransactionsDrawer } from '@/components/accounts/AccountTransactionsDrawer';
import { ReconciliationBanner } from '@/components/accounts/ReconciliationBanner';

import {
  PlusCircle,
  ArrowRightLeft,
  Search,
  Building2,
  Globe,
  PenTool,
  Sparkles,
} from 'lucide-react';

export const Route = createFileRoute('/contas')({
  head: () => ({
    meta: [
      { title: 'Contas Bancárias | Painel Financeiro' },
      {
        name: 'description',
        content:
          'Gerencie suas contas bancárias em um só lugar. Cadastro manual e conexão automática via Open Finance.',
      },
      { property: 'og:title', content: 'Contas Bancárias | Painel Financeiro' },
      {
        property: 'og:description',
        content:
          'Gerencie suas contas bancárias em um só lugar. Cadastro manual e conexão automática via Open Finance.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Page,
});

type TabFilter = 'todas' | 'manual' | 'open_finance';

function Page() {
  const { data: accounts = [], isLoading } = useAccounts();

  // Filter & Search states
  const [tabFilter, setTabFilter] = useState<TabFilter>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [openFinanceModalOpen, setOpenFinanceModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [updateBalanceModalOpen, setUpdateBalanceModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Selected account for modals
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);

  // Handlers for AccountCard triggers
  const handleUpdateBalance = (account: BankAccount) => {
    setSelectedAccount(account);
    setUpdateBalanceModalOpen(true);
  };

  const handleAddTransaction = (account: BankAccount) => {
    setSelectedAccount(account);
    setTransactionModalOpen(true);
  };

  const handleTransfer = (account: BankAccount) => {
    setSelectedAccount(account);
    setTransferModalOpen(true);
  };

  const handleViewStatement = (account: BankAccount) => {
    setSelectedAccount(account);
    setDrawerOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setAccountToEdit(account);
    setManualFormOpen(true);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (tabFilter !== 'todas' && acc.origem !== tabFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = acc.nome.toLowerCase().includes(q);
      const matchInst = acc.instituicao.toLowerCase().includes(q);
      if (!matchName && !matchInst) return false;
    }
    return true;
  });

  return (
    <PageShell
      title="Minhas Contas"
      subtitle="Gerencie suas contas bancárias em um só lugar"
    >
      <div className="flex flex-col gap-6">
        {/* Top Summary Metrics */}
        <AccountSummaryCards accounts={accounts} isLoading={isLoading} />

        {/* Possible Duplicates / Reconciliation Banner */}
        <ReconciliationBanner />

        {/* Action Controls & Filters Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-secondary/60 p-1 border border-border">
              <button
                type="button"
                onClick={() => setTabFilter('todas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tabFilter === 'todas'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todas ({accounts.length})
              </button>

              <button
                type="button"
                onClick={() => setTabFilter('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  tabFilter === 'manual'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PenTool className="size-3" />
                Manuais ({accounts.filter((a) => a.origem === 'manual').length})
              </button>

              <button
                type="button"
                onClick={() => setTabFilter('open_finance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  tabFilter === 'open_finance'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="size-3 text-sky-500" />
                Open Finance ({accounts.filter((a) => a.origem === 'open_finance').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 text-xs pl-8 bg-card border-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {accounts.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAccount(null);
                  setTransferModalOpen(true);
                }}
                className="h-9 text-xs border-border hover:bg-secondary gap-1.5 rounded-xl font-medium"
              >
                <ArrowRightLeft className="size-3.5 text-muted-foreground" />
                Transferência
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => {
                setAccountToEdit(null);
                setChoiceModalOpen(true);
              }}
              className="w-full sm:w-auto h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 rounded-xl shadow-xs gap-1.5"
            >
              <PlusCircle className="size-4" />
              + Adicionar conta
            </Button>
          </div>
        </div>

        {/* Accounts Grid */}
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdateBalance={handleUpdateBalance}
                onAddTransaction={handleAddTransaction}
                onTransfer={handleTransfer}
                onViewStatement={handleViewStatement}
                onEdit={handleEditAccount}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Building2 className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Nenhuma conta encontrada
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Você ainda não possui contas cadastradas com os filtros selecionados. Comece adicionando sua primeira conta manual ou conectando via Open Finance.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAccountToEdit(null);
                  setManualFormOpen(true);
                }}
                className="text-xs h-9 border-border gap-1.5"
              >
                <PenTool className="size-3.5" />
                Cadastrar manualmente
              </Button>
              <Button
                size="sm"
                onClick={() => setOpenFinanceModalOpen(true)}
                className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-xs"
              >
                <Globe className="size-3.5" />
                Conectar via Open Finance
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Choice Modal */}
      <AddAccountChoiceModal
        open={choiceModalOpen}
        onOpenChange={setChoiceModalOpen}
        onSelectManual={() => {
          setAccountToEdit(null);
          setManualFormOpen(true);
        }}
        onSelectOpenFinance={() => setOpenFinanceModalOpen(true)}
      />

      {/* 2. Manual Form Modal */}
      <ManualAccountFormModal
        open={manualFormOpen}
        onOpenChange={setManualFormOpen}
        accountToEdit={accountToEdit}
      />

      {/* 3. Open Finance Modal */}
      <OpenFinanceModal
        open={openFinanceModalOpen}
        onOpenChange={setOpenFinanceModalOpen}
      />

      {/* 4. Update Balance Modal */}
      <UpdateBalanceModal
        account={selectedAccount}
        open={updateBalanceModalOpen}
        onOpenChange={setUpdateBalanceModalOpen}
      />

      {/* 5. Add Account Transaction Modal */}
      <AccountTransactionModal
        account={selectedAccount}
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
      />

      {/* 6. Transfer Modal */}
      <TransferModal
        accounts={accounts}
        defaultOrigemId={selectedAccount?.id}
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
      />

      {/* 7. Statement Drawer */}
      <AccountTransactionsDrawer
        account={selectedAccount}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onOpenNewTransaction={() => {
          if (selectedAccount) {
            setTransactionModalOpen(true);
          }
        }}
      />
    </PageShell>
  );
}
