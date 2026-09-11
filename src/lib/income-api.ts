import {
  Receivable,
  ReceivableFilters,
  ReceivableFormData,
} from './receivable-types';
import {
  fetchReceivables,
  createReceivable,
  updateReceivable,
  deleteReceivable,
  deleteReceivableAndFuture,
  markAsReceived,
  duplicateReceivable,
  getAllReceivables,
} from './receivable-api';
import {
  IncomeFilters,
  IncomeFormData,
  IncomeSummary,
  IncomeRecord,
} from './income-types';

export async function fetchIncomes(filters: IncomeFilters = {}): Promise<IncomeRecord[]> {
  const mappedFilters: ReceivableFilters = {
    month: filters.month,
    year: filters.year,
    categoria: filters.categoria,
    origem: filters.origem,
    search: filters.search,
    sortBy: 'vencimento',
    sortOrder: 'asc',
  };

  if (filters.status && filters.status !== 'Todos') {
    mappedFilters.status = filters.status === 'Previsto' ? 'Pendente' : filters.status;
  }

  const items = await fetchReceivables(mappedFilters);

  if (filters.recorrente !== undefined) {
    return items.filter((i) => Boolean(i.recorrente) === filters.recorrente);
  }
  if (filters.parcelado !== undefined) {
    return items.filter((i) => Boolean(i.parcelado) === filters.parcelado);
  }

  return items;
}

export async function getIncomeSummary(month?: number, year?: number): Promise<IncomeSummary> {
  const all = await getAllReceivables();

  const filtered =
    month !== undefined && year !== undefined
      ? all.filter((item) => {
          const parts = item.dataPrevisao.split('-');
          if (parts.length < 2) return true;
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          return y === year && m === month;
        })
      : all;

  let receitasDoMes = 0;
  let recebido = 0;
  let previsto = 0;

  for (const item of filtered) {
    receitasDoMes += item.valor;

    if (item.status === 'Recebido') {
      recebido += item.valor;
    } else if (item.status === 'Parcial') {
      const rec = item.valorRecebido || 0;
      recebido += rec;
      previsto += item.valor - rec;
    } else {
      previsto += item.valor;
    }
  }

  const quantidade = filtered.length;
  const media = quantidade > 0 ? Math.round(receitasDoMes / quantidade) : 0;
  const percentualRecebido = receitasDoMes > 0 ? Math.round((recebido / receitasDoMes) * 100) : 0;

  return {
    receitasDoMes,
    recebido,
    previsto,
    quantidade,
    media,
    percentualRecebido,
  };
}

export async function createIncome(data: IncomeFormData): Promise<IncomeRecord[]> {
  const receivableData: ReceivableFormData = {
    descricao: data.descricao,
    valor: data.valor,
    categoria: data.categoria,
    origem: data.origem,
    dataPrevisao: data.data,
    dataRecebimento: data.status === 'Recebido' ? data.data : null,
    status: data.status === 'Recebido' ? 'Recebido' : 'Pendente',
    observacao: data.observacao,
    recorrente: data.recorrente,
    frequenciaRecorrencia: data.frequenciaRecorrencia,
    parcelado: data.parcelado,
    totalParcelas: data.totalParcelas,
  };

  return createReceivable(receivableData);
}

export async function updateIncome(id: string, data: Partial<IncomeFormData>): Promise<IncomeRecord> {
  const patch: Partial<ReceivableFormData> = {};
  if (data.descricao !== undefined) patch.descricao = data.descricao;
  if (data.valor !== undefined) patch.valor = data.valor;
  if (data.categoria !== undefined) patch.categoria = data.categoria;
  if (data.origem !== undefined) patch.origem = data.origem;
  if (data.data !== undefined) patch.dataPrevisao = data.data;
  if (data.observacao !== undefined) patch.observacao = data.observacao;
  if (data.status !== undefined) {
    patch.status = data.status === 'Recebido' ? 'Recebido' : 'Pendente';
    if (data.status === 'Recebido' && !data.data) {
      patch.dataRecebimento = new Date().toISOString().split('T')[0];
    }
  }

  return updateReceivable(id, patch);
}

export async function deleteIncome(id: string): Promise<void> {
  return deleteReceivable(id);
}

export async function deleteIncomeAndFuture(id: string): Promise<void> {
  return deleteReceivableAndFuture(id);
}

export async function markIncomeAsReceived(id: string): Promise<IncomeRecord> {
  return markAsReceived(id);
}

export async function duplicateIncome(id: string): Promise<IncomeRecord> {
  return duplicateReceivable(id);
}
