import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchAccounts,
  fetchAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
  transferFunds,
  addAccountTransaction,
  connectOpenFinance,
  syncOpenFinanceAccount,
  reconnectOpenFinanceAccount,
  fetchAccountTransactions,
  fetchReconciliationSuggestions,
  resolveReconciliation,
} from '@/lib/account-api';
import {
  CreateAccountFormData,
  UpdateBalanceData,
  TransferFundsData,
  AddTransactionData,
  AccountType,
} from '@/lib/account-types';

export function useAccounts() {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => fetchAccounts(),
  });
}

export function useAccount(id?: string) {
  return useQuery({
    queryKey: ['bank-account', id],
    queryFn: () => (id ? fetchAccountById(id) : undefined),
    enabled: Boolean(id),
  });
}

export function useAccountTransactions(contaId?: string) {
  return useQuery({
    queryKey: ['bank-account-transactions', contaId],
    queryFn: () => fetchAccountTransactions(contaId),
  });
}

export function useReconciliationSuggestions() {
  return useQuery({
    queryKey: ['bank-reconciliation-suggestions'],
    queryFn: () => fetchReconciliationSuggestions(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountFormData) => createAccount(data),
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      toast.success(`Conta "${newAccount.nome}" cadastrada com sucesso!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao cadastrar conta bancária.');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountFormData> }) =>
      updateAccount(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account', updated.id] });
      toast.success('Conta atualizada com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao atualizar conta.');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation-suggestions'] });
      toast.success('Conta removida com sucesso.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao excluir conta.');
    },
  });
}

export function useUpdateAccountBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBalanceData) => updateAccountBalance(data),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account', account.id] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      toast.success('Saldo da conta atualizado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao atualizar saldo.');
    },
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferFundsData) => transferFunds(data),
    onSuccess: ({ origem, destino }) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      toast.success(
        `Transferência de ${origem.nome} para ${destino.nome} realizada com sucesso!`
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao realizar transferência.');
    },
  });
}

export function useAddAccountTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddTransactionData) => addAccountTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation-suggestions'] });
      toast.success('Movimentação registrada com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao registrar movimentação.');
    },
  });
}

export function useConnectOpenFinance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      institutionKey,
      nomeCustom,
      tipo,
    }: {
      institutionKey: string;
      nomeCustom?: string;
      tipo?: AccountType;
    }) => connectOpenFinance(institutionKey, nomeCustom, tipo),
    onSuccess: (acc) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      toast.success(
        `Instituição ${acc.instituicao} conectada via Open Finance!`
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao conectar via Open Finance.');
    },
  });
}

export function useSyncOpenFinanceAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => syncOpenFinanceAccount(id),
    onSuccess: (acc) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account', acc.id] });
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      toast.success(`Conta ${acc.nome} sincronizada com sucesso!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao sincronizar conta.');
    },
  });
}

export function useReconnectOpenFinanceAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reconnectOpenFinanceAccount(id),
    onSuccess: (acc) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-account', acc.id] });
      toast.success(`Conta ${acc.nome} reconectada com sucesso!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao reconectar conta.');
    },
  });
}

export function useResolveReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      manualTxId,
      openFinanceTxId,
      action,
    }: {
      manualTxId: string;
      openFinanceTxId: string;
      action: 'keep_both' | 'merge';
    }) => resolveReconciliation(manualTxId, openFinanceTxId, action),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['bank-account-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation-suggestions'] });
      if (vars.action === 'merge') {
        toast.success('Movimentações mescladas com sucesso!');
      } else {
        toast.success('Ambas as movimentações foram mantidas.');
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao processar conciliação.');
    },
  });
}
