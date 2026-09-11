import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchIncomes,
  getIncomeSummary,
  createIncome,
  updateIncome,
  deleteIncome,
  deleteIncomeAndFuture,
  markIncomeAsReceived,
  duplicateIncome,
} from '../lib/income-api';
import {
  IncomeFilters,
  IncomeFormData,
} from '../lib/income-types';

export function useIncomes(filters: IncomeFilters = {}) {
  return useQuery({
    queryKey: ['incomes', filters],
    queryFn: () => fetchIncomes(filters),
  });
}

export function useIncomeSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['incomes-summary', month, year],
    queryFn: () => getIncomeSummary(month, year),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IncomeFormData) => createIncome(data),
    onSuccess: (items) => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });

      if (items.length > 1) {
        toast.success(`${items.length} parcelas de receita criadas!`);
      } else {
        toast.success('Receita cadastrada com sucesso!');
      }
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar receita: ${err.message}`);
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IncomeFormData> }) =>
      updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Receita atualizada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar receita: ${err.message}`);
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Receita excluída!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir receita: ${err.message}`);
    },
  });
}

export function useDeleteIncomeAndFuture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIncomeAndFuture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Parcelas de receita excluídas!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir parcelas: ${err.message}`);
    },
  });
}

export function useMarkIncomeAsReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markIncomeAsReceived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Receita marcada como recebida!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao marcar como recebida: ${err.message}`);
    },
  });
}

export function useDuplicateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Receita duplicada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao duplicar: ${err.message}`);
    },
  });
}
