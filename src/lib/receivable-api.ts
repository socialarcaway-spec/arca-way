import {
  Receivable,
  ReceivableFilters,
  ReceivableFormData,
  ReceivableSummary,
} from './receivable-types';

const STORAGE_KEY = 'arca_receivables_v1';

// Initial sample data if local storage is empty
const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'rec-sample-1',
    userId: 1,
    descricao: 'Desenvolvimento Web - Cliente ACME',
    valor: 450000, // R$ 4.500,00
    valorRecebido: 450000,
    categoria: 'Serviços',
    origem: 'Cliente',
    dataPrevisao: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    dataRecebimento: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    status: 'Recebido',
    observacao: 'Projeto de redesign do portal corporativo',
    recorrente: false,
    parcelado: true,
    parcelaNumero: 1,
    totalParcelas: 2,
    grupoParcelamentoId: 'grp-acme-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-sample-2',
    userId: 1,
    descricao: 'Desenvolvimento Web - Cliente ACME (2/2)',
    valor: 450000, // R$ 4.500,00
    valorRecebido: null,
    categoria: 'Serviços',
    origem: 'Cliente',
    dataPrevisao: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString().split('T')[0],
    dataRecebimento: null,
    status: 'Pendente',
    observacao: 'Segunda parcela do projeto ACME',
    recorrente: false,
    parcelado: true,
    parcelaNumero: 2,
    totalParcelas: 2,
    grupoParcelamentoId: 'grp-acme-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-sample-3',
    userId: 1,
    descricao: 'Consultoria Mensal Tech Corp',
    valor: 280000, // R$ 2.800,00
    valorRecebido: null,
    categoria: 'Serviços',
    origem: 'Cliente',
    dataPrevisao: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    dataRecebimento: null,
    status: 'Pendente',
    observacao: 'Retainer mensal de consultoria em infraestrutura',
    recorrente: true,
    frequenciaRecorrencia: 'Mensal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-sample-4',
    userId: 1,
    descricao: 'Venda de Licença de Software',
    valor: 120000, // R$ 1.200,00
    valorRecebido: 50000, // R$ 500,00 parcial
    categoria: 'Vendas',
    origem: 'Venda',
    dataPrevisao: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
    dataRecebimento: null,
    status: 'Parcial',
    observacao: 'Sinal pago R$ 500,00. Restante R$ 700,00 no final do mês',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-sample-5',
    userId: 1,
    descricao: 'Reembolso Despesas de Viagem',
    valor: 65000, // R$ 650,00
    valorRecebido: null,
    categoria: 'Reembolso',
    origem: 'Outros',
    dataPrevisao: new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0],
    dataRecebimento: null,
    status: 'Atrasado',
    observacao: 'Passagens e hospedagem evento SP',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getStoredData(): Receivable[] {
  if (typeof window === 'undefined') return INITIAL_RECEIVABLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECEIVABLES));
      return INITIAL_RECEIVABLES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading receivables from localStorage', err);
    return INITIAL_RECEIVABLES;
  }
}

function saveStoredData(data: Receivable[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error writing receivables to localStorage', err);
  }
}

function normalizeStatus(receivable: Receivable): Receivable {
  const todayStr = new Date().toISOString().split('T')[0];
  if (receivable.status !== 'Recebido' && receivable.dataPrevisao < todayStr) {
    return { ...receivable, status: 'Atrasado' };
  }
  return receivable;
}

export async function fetchReceivables(filters: ReceivableFilters = {}): Promise<Receivable[]> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 150));

  let items = getStoredData().map(normalizeStatus);

  if (filters.month !== undefined && filters.year !== undefined) {
    items = items.filter((item) => {
      const parts = item.dataPrevisao.split('-');
      if (parts.length < 2) return true;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return y === filters.year && m === filters.month;
    });
  }

  if (filters.status && filters.status !== 'Todos') {
    items = items.filter((item) => item.status === filters.status);
  }

  if (filters.categoria) {
    items = items.filter(
      (item) => item.categoria.toLowerCase() === filters.categoria?.toLowerCase()
    );
  }

  if (filters.origem) {
    items = items.filter(
      (item) => item.origem.toLowerCase() === filters.origem?.toLowerCase()
    );
  }

  if (filters.search && filters.search.trim() !== '') {
    const term = filters.search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.descricao.toLowerCase().includes(term) ||
        (item.observacao && item.observacao.toLowerCase().includes(term)) ||
        item.origem.toLowerCase().includes(term) ||
        item.categoria.toLowerCase().includes(term)
    );
  }

  // Sorting
  const sortBy = filters.sortBy || 'vencimento';
  const sortOrder = filters.sortOrder || 'asc';

  items.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'vencimento') {
      comparison = a.dataPrevisao.localeCompare(b.dataPrevisao);
    } else if (sortBy === 'valor') {
      comparison = a.valor - b.valor;
    } else if (sortBy === 'descricao') {
      comparison = a.descricao.localeCompare(b.descricao);
    } else if (sortBy === 'origem') {
      comparison = a.origem.localeCompare(b.origem);
    } else if (sortBy === 'categoria') {
      comparison = a.categoria.localeCompare(b.categoria);
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return items;
}

export async function getReceivableSummary(month?: number, year?: number): Promise<ReceivableSummary> {
  const all = getStoredData().map(normalizeStatus);
  
  const filtered = (month !== undefined && year !== undefined)
    ? all.filter((item) => {
        const parts = item.dataPrevisao.split('-');
        if (parts.length < 2) return true;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        return y === year && m === month;
      })
    : all;

  let totalPrevisto = 0;
  let totalRecebido = 0;
  let totalPendente = 0;
  let totalAtrasado = 0;

  let countRecebido = 0;
  let countPendente = 0;
  let countAtrasado = 0;
  let countParcial = 0;

  for (const item of filtered) {
    totalPrevisto += item.valor;

    if (item.status === 'Recebido') {
      totalRecebido += item.valor;
      countRecebido++;
    } else if (item.status === 'Parcial') {
      const rec = item.valorRecebido || 0;
      totalRecebido += rec;
      totalPendente += item.valor - rec;
      countParcial++;
    } else if (item.status === 'Atrasado') {
      totalAtrasado += item.valor;
      countAtrasado++;
    } else {
      totalPendente += item.valor;
      countPendente++;
    }
  }

  const countTotal = filtered.length;
  const percentualRecebido = totalPrevisto > 0 ? Math.round((totalRecebido / totalPrevisto) * 100) : 0;

  return {
    totalPrevisto,
    totalRecebido,
    totalPendente,
    totalAtrasado,
    countTotal,
    countRecebido,
    countPendente,
    countAtrasado,
    countParcial,
    percentualRecebido,
  };
}

export async function createReceivable(data: ReceivableFormData): Promise<Receivable[]> {
  await new Promise((res) => setTimeout(res, 200));

  const all = getStoredData();
  const nowStr = new Date().toISOString();
  const createdItems: Receivable[] = [];

  const isInstallments = data.parcelado && (data.totalParcelas || 1) > 1;
  const totalParcelas = isInstallments ? data.totalParcelas! : 1;
  const grupoId = isInstallments ? `grp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` : undefined;

  // Divide total amount across installments
  const totalCents = data.valor;
  const baseParcelaCents = Math.floor(totalCents / totalParcelas);
  const remainderCents = totalCents - baseParcelaCents * totalParcelas;

  const baseDateParts = data.dataPrevisao.split('-');
  const baseYear = parseInt(baseDateParts[0], 10);
  const baseMonth = parseInt(baseDateParts[1], 10) - 1; // 0-indexed
  const baseDay = parseInt(baseDateParts[2], 10);

  for (let i = 0; i < totalParcelas; i++) {
    const parcelaNum = i + 1;
    // Add 1 cent remainder to initial installments if any
    const valorParcela = baseParcelaCents + (i < remainderCents ? 1 : 0);

    // Calculate installment date (+ i months)
    const targetDate = new Date(baseYear, baseMonth + i, baseDay);
    // Handle month overflow day mismatch (e.g. Jan 31 -> Feb 28)
    if (targetDate.getDate() !== baseDay && targetDate.getMonth() !== (baseMonth + i) % 12) {
      targetDate.setDate(0); // last day of previous month
    }
    const dataPrevisaoIso = targetDate.toISOString().split('T')[0];

    const desc = isInstallments ? `${data.descricao} (${parcelaNum}/${totalParcelas})` : data.descricao;

    const newItem: Receivable = {
      id: `rec-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      userId: 1,
      descricao: desc,
      valor: valorParcela,
      valorRecebido: null,
      categoria: data.categoria,
      origem: data.origem,
      dataPrevisao: dataPrevisaoIso,
      dataRecebimento: null,
      status: data.status || 'Pendente',
      observacao: data.observacao,
      recorrente: data.recorrente,
      frequenciaRecorrencia: data.frequenciaRecorrencia,
      parcelado: data.parcelado,
      parcelaNumero: isInstallments ? parcelaNum : undefined,
      totalParcelas: isInstallments ? totalParcelas : undefined,
      grupoParcelamentoId: grupoId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    createdItems.push(newItem);
  }

  const updated = [...all, ...createdItems];
  saveStoredData(updated);

  return createdItems;
}

export async function updateReceivable(id: string, data: Partial<ReceivableFormData>): Promise<Receivable> {
  await new Promise((res) => setTimeout(res, 200));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Conta a receber não encontrada.');
  }

  const current = all[index];
  const updatedItem: Receivable = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveStoredData(all);

  return updatedItem;
}

export async function updateReceivableAndFuture(
  id: string,
  data: Partial<ReceivableFormData>
): Promise<Receivable[]> {
  await new Promise((res) => setTimeout(res, 250));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error('Conta a receber não encontrada.');

  if (!target.grupoParcelamentoId) {
    const updated = await updateReceivable(id, data);
    return [updated];
  }

  const currentParcela = target.parcelaNumero || 1;
  const updatedList: Receivable[] = [];

  const newAll = all.map((item) => {
    if (
      item.grupoParcelamentoId === target.grupoParcelamentoId &&
      (item.parcelaNumero || 0) >= currentParcela
    ) {
      const newItem = {
        ...item,
        categoria: data.categoria ?? item.categoria,
        origem: data.origem ?? item.origem,
        observacao: data.observacao ?? item.observacao,
        updatedAt: new Date().toISOString(),
      };
      updatedList.push(newItem);
      return newItem;
    }
    return item;
  });

  saveStoredData(newAll);
  return updatedList;
}

export async function deleteReceivable(id: string): Promise<void> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const filtered = all.filter((r) => r.id !== id);
  saveStoredData(filtered);
}

export async function deleteReceivableAndFuture(id: string): Promise<void> {
  await new Promise((res) => setTimeout(res, 200));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) return;

  if (!target.grupoParcelamentoId) {
    return deleteReceivable(id);
  }

  const currentParcela = target.parcelaNumero || 1;
  const filtered = all.filter(
    (item) =>
      !(
        item.grupoParcelamentoId === target.grupoParcelamentoId &&
        (item.parcelaNumero || 0) >= currentParcela
      )
  );

  saveStoredData(filtered);
}

export async function markAsReceived(id: string): Promise<Receivable> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Conta a receber não encontrada');

  const current = all[index];
  // Idempotency check: if already received, return current
  if (current.status === 'Recebido') return current;

  const todayStr = new Date().toISOString().split('T')[0];
  const updatedItem: Receivable = {
    ...current,
    status: 'Recebido',
    dataRecebimento: todayStr,
    valorRecebido: current.valor,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveStoredData(all);

  return updatedItem;
}

export async function markAsPartiallyReceived(id: string, valorRecebidoCents: number): Promise<Receivable> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Conta a receber não encontrada');

  const current = all[index];
  const isFull = valorRecebidoCents >= current.valor;
  const todayStr = new Date().toISOString().split('T')[0];

  const updatedItem: Receivable = {
    ...current,
    status: isFull ? 'Recebido' : 'Parcial',
    valorRecebido: valorRecebidoCents,
    dataRecebimento: todayStr,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveStoredData(all);

  return updatedItem;
}

export async function duplicateReceivable(id: string): Promise<Receivable> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error('Conta a receber não encontrada');

  const nowStr = new Date().toISOString();
  const clone: Receivable = {
    ...target,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    descricao: `${target.descricao} (Cópia)`,
    status: 'Pendente',
    valorRecebido: null,
    dataRecebimento: null,
    grupoParcelamentoId: undefined,
    parcelaNumero: undefined,
    totalParcelas: undefined,
    parcelado: false,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  all.push(clone);
  saveStoredData(all);

  return clone;
}

export async function getAllReceivables(): Promise<Receivable[]> {
  return getStoredData().map(normalizeStatus);
}
