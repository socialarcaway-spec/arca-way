import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchPayables,
  getPayableSummary,
  createPayable,
  updatePayable,
  updatePayableAndFuture,
  deletePayable,
  deletePayableAndFuture,
  markAsPaid,
  duplicatePayable,
  getAllPayables,
} from '../lib/payable-api';
import {
  PayableFilters,
  PayableFormData,
} from '../lib/payable-types';

export function usePayables(filters: PayableFilters = {}) {
  return useQuery({
    queryKey: ['payables', filters],
    queryFn: () => fetchPayables(filters),
  });
}

export function usePayableSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['payables-summary', month, year],
    queryFn: () => getPayableSummary(month, year),
  });
}

export function useAllPayables() {
  return useQuery({
    queryKey: ['payables-all'],
    queryFn: () => getAllPayables(),
  });
}

export function useCreatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PayableFormData) => createPayable(data),
    onSuccess: (items) => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });

      if (items.length > 1) {
        toast.success(`${items.length} parcelas/lançamentos criados com sucesso!`);
      } else {
        toast.success('Conta a pagar cadastrada com sucesso!');
      }
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar conta a pagar: ${err.message}`);
    },
  });
}

export function useUpdatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PayableFormData> }) =>
      updatePayable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Conta a pagar atualizada!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar: ${err.message}`);
    },
  });
}

export function useUpdatePayableAndFuture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PayableFormData> }) =>
      updatePayableAndFuture(id, data),
    onSuccess: (updatedItems) => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(`${updatedItems.length} parcela(s) atualizada(s)!`);
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar parcelas: ${err.message}`);
    },
  });
}

export function useDeletePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Conta a pagar excluída!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir: ${err.message}`);
    },
  });
}

export function useDeletePayableAndFuture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayableAndFuture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Parcelas excluídas com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir parcelas: ${err.message}`);
    },
  });
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dataPagamento }: { id: string; dataPagamento?: string }) =>
      markAsPaid(id, dataPagamento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Conta marcada como paga!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao marcar como paga: ${err.message}`);
    },
  });
}

export function useDuplicatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicatePayable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] });
      queryClient.invalidateQueries({ queryKey: ['payables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payables-all'] });
      toast.success('Conta duplicada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao duplicar: ${err.message}`);
    },
  });
}
