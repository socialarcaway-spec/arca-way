import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchReceivables,
  getReceivableSummary,
  createReceivable,
  updateReceivable,
  updateReceivableAndFuture,
  deleteReceivable,
  deleteReceivableAndFuture,
  markAsReceived,
  markAsPartiallyReceived,
  duplicateReceivable,
  getAllReceivables,
} from '../lib/receivable-api';
import {
  ReceivableFilters,
  ReceivableFormData,
  Receivable,
} from '../lib/receivable-types';

export function useReceivables(filters: ReceivableFilters = {}) {
  return useQuery({
    queryKey: ['receivables', filters],
    queryFn: () => fetchReceivables(filters),
  });
}

export function useReceivableSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['receivables-summary', month, year],
    queryFn: () => getReceivableSummary(month, year),
  });
}

export function useAllReceivables() {
  return useQuery({
    queryKey: ['receivables-all'],
    queryFn: () => getAllReceivables(),
  });
}

export function useCreateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReceivableFormData) => createReceivable(data),
    onSuccess: (items) => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });

      if (items.length > 1) {
        toast.success(`${items.length} parcelas criadas com sucesso!`);
      } else {
        toast.success('Conta a receber cadastrada com sucesso!');
      }
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar conta a receber: ${err.message}`);
    },
  });
}

export function useUpdateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReceivableFormData> }) =>
      updateReceivable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Conta a receber atualizada!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar: ${err.message}`);
    },
  });
}

export function useUpdateReceivableAndFuture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReceivableFormData> }) =>
      updateReceivableAndFuture(id, data),
    onSuccess: (updatedItems) => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success(`${updatedItems.length} parcela(s) atualizada(s)!`);
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar parcelas: ${err.message}`);
    },
  });
}

export function useDeleteReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReceivable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Conta a receber excluída.');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir: ${err.message}`);
    },
  });
}

export function useDeleteReceivableAndFuture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReceivableAndFuture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Parcela atual e futuras foram excluídas.');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao excluir parcelas: ${err.message}`);
    },
  });
}

export function useMarkAsReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsReceived(id),
    onSuccess: (item: Receivable) => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success(`"${item.descricao}" marcada como recebida!`);
    },
    onError: (err: Error) => {
      toast.error(`Erro ao marcar como recebido: ${err.message}`);
    },
  });
}

export function useMarkAsPartiallyReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, valorRecebidoCents }: { id: string; valorRecebidoCents: number }) =>
      markAsPartiallyReceived(id, valorRecebidoCents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Recebimento parcial registrado!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao registrar recebimento parcial: ${err.message}`);
    },
  });
}

export function useDuplicateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateReceivable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-all'] });
      toast.success('Conta a receber duplicada!');
    },
    onError: (err: Error) => {
      toast.error(`Erro ao duplicar: ${err.message}`);
    },
  });
}
