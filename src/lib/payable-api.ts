import {
  Payable,
  PayableFilters,
  PayableFormData,
  PayableSummary,
  RecurrenceFrequency,
} from './payable-types';

const STORAGE_KEY = 'arca_payables_v1';

// Seed initial sample data if localStorage is empty
function getInitialPayables(): Payable[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const pad = (n: number) => String(n).padStart(2, '0');
  const dStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  return [
    {
      id: 'pay-sample-1',
      userId: 1,
      descricao: 'Aluguel do Apartamento',
      valor: 240000, // R$ 2.400,00
      valorPago: null,
      categoria: 'Moradia',
      dataVencimento: dStr(currentYear, currentMonth, 10),
      dataPagamento: null,
      formaPagamento: 'Boleto',
      status: 'Pendente',
      observacao: 'Aluguel + condomínio incluso',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-2',
      userId: 1,
      descricao: 'Energia Elétrica - Enel',
      valor: 18550, // R$ 185,50
      valorPago: 18550,
      categoria: 'Moradia',
      dataVencimento: dStr(currentYear, currentMonth, 5),
      dataPagamento: dStr(currentYear, currentMonth, 4),
      formaPagamento: 'Pix',
      status: 'Pago',
      observacao: 'Conta de luz quitada via Pix',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-3',
      userId: 1,
      descricao: 'Internet Fibra 600MB',
      valor: 12000, // R$ 120,00
      valorPago: 12000,
      categoria: 'Assinaturas',
      dataVencimento: dStr(currentYear, currentMonth, 10),
      dataPagamento: dStr(currentYear, currentMonth, 10),
      formaPagamento: 'Débito Automático',
      status: 'Pago',
      observacao: 'Todo dia 10 em débito em conta',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-4',
      userId: 1,
      descricao: 'Supermercado Mensal',
      valor: 145000, // R$ 1.450,00
      valorPago: null,
      categoria: 'Alimentação',
      dataVencimento: dStr(currentYear, currentMonth, 1),
      dataPagamento: null,
      formaPagamento: 'Cartão de Crédito',
      status: 'Atrasado',
      observacao: 'Compras do mês',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-5',
      userId: 1,
      descricao: 'Notebook Dell XPS (1/10)',
      valor: 85000, // R$ 850,00 da parcela (Total da compra R$ 8.500)
      valorPago: null,
      categoria: 'Serviços',
      dataVencimento: dStr(currentYear, currentMonth, 20),
      dataPagamento: null,
      formaPagamento: 'Cartão de Crédito',
      status: 'Pendente',
      observacao: 'Compra parcelada em 10x sem juros',
      parcelado: true,
      parcelaNumero: 1,
      totalParcelas: 10,
      grupoParcelamentoId: 'grp-notebook-xps',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-6',
      userId: 1,
      descricao: 'Notebook Dell XPS (2/10)',
      valor: 85000, // R$ 850,00 da parcela
      valorPago: null,
      categoria: 'Serviços',
      dataVencimento: dStr(currentYear, currentMonth + 1, 20),
      dataPagamento: null,
      formaPagamento: 'Cartão de Crédito',
      status: 'Pendente',
      observacao: 'Segunda parcela',
      parcelado: true,
      parcelaNumero: 2,
      totalParcelas: 10,
      grupoParcelamentoId: 'grp-notebook-xps',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-7',
      userId: 1,
      descricao: 'Plano de Saúde Familiar',
      valor: 78000, // R$ 780,00
      valorPago: null,
      categoria: 'Saúde',
      dataVencimento: dStr(currentYear, currentMonth, 25),
      dataPagamento: null,
      formaPagamento: 'Boleto',
      status: 'Pendente',
      observacao: 'Mensalidade Unimed',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getStoredData(): Payable[] {
  if (typeof window === 'undefined') return getInitialPayables();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialPayables();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading payables from localStorage', err);
    return getInitialPayables();
  }
}

function saveStoredData(data: Payable[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error writing payables to localStorage', err);
  }
}

function normalizeStatus(payable: Payable): Payable {
  const todayStr = new Date().toISOString().split('T')[0];
  if (payable.status !== 'Pago' && payable.dataVencimento < todayStr) {
    return { ...payable, status: 'Atrasado' };
  }
  return payable;
}

export async function fetchPayables(filters: PayableFilters = {}): Promise<Payable[]> {
  await new Promise((res) => setTimeout(res, 100));

  let items = getStoredData().map(normalizeStatus);

  // Month & Year Filter
  if (filters.month !== undefined && filters.year !== undefined) {
    items = items.filter((item) => {
      const parts = item.dataVencimento.split('-');
      if (parts.length < 2) return true;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return y === filters.year && m === filters.month;
    });
  }

  // Status Filter
  if (filters.status && filters.status !== 'Todos') {
    items = items.filter((item) => item.status === filters.status);
  }

  // Category Filter
  if (filters.categoria && filters.categoria !== 'Todas') {
    items = items.filter(
      (item) => item.categoria.toLowerCase() === filters.categoria?.toLowerCase()
    );
  }

  // Payment Method Filter
  if (filters.formaPagamento && filters.formaPagamento !== 'Todas') {
    items = items.filter(
      (item) => item.formaPagamento.toLowerCase() === filters.formaPagamento?.toLowerCase()
    );
  }

  // Recorrente Filter
  if (filters.recorrente !== undefined) {
    items = items.filter((item) => Boolean(item.recorrente) === filters.recorrente);
  }

  // Parcelado Filter
  if (filters.parcelado !== undefined) {
    items = items.filter((item) => Boolean(item.parcelado) === filters.parcelado);
  }

  // Search Filter
  if (filters.search && filters.search.trim() !== '') {
    const term = filters.search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.descricao.toLowerCase().includes(term) ||
        (item.observacao && item.observacao.toLowerCase().includes(term)) ||
        item.categoria.toLowerCase().includes(term) ||
        item.formaPagamento.toLowerCase().includes(term)
    );
  }

  // Sorting
  const sortBy = filters.sortBy || 'vencimento';
  const sortOrder = filters.sortOrder || 'asc';

  items.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'vencimento') {
      comparison = a.dataVencimento.localeCompare(b.dataVencimento);
    } else if (sortBy === 'valor') {
      comparison = a.valor - b.valor;
    } else if (sortBy === 'descricao') {
      comparison = a.descricao.localeCompare(b.descricao);
    } else if (sortBy === 'categoria') {
      comparison = a.categoria.localeCompare(b.categoria);
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy === 'formaPagamento') {
      comparison = a.formaPagamento.localeCompare(b.formaPagamento);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return items;
}

export async function getPayableSummary(month?: number, year?: number): Promise<PayableSummary> {
  const all = getStoredData().map(normalizeStatus);

  const filtered =
    month !== undefined && year !== undefined
      ? all.filter((item) => {
          const parts = item.dataVencimento.split('-');
          if (parts.length < 2) return true;
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          return y === year && m === month;
        })
      : all;

  let totalMes = 0;
  let totalPago = 0;
  let totalPendente = 0;
  let totalAtrasado = 0;

  let countPago = 0;
  let countPendente = 0;
  let countAtrasado = 0;

  for (const item of filtered) {
    totalMes += item.valor;

    if (item.status === 'Pago') {
      totalPago += item.valor;
      countPago++;
    } else if (item.status === 'Atrasado') {
      totalAtrasado += item.valor;
      countAtrasado++;
    } else {
      totalPendente += item.valor;
      countPendente++;
    }
  }

  const countTotal = filtered.length;
  const percentualPago = totalMes > 0 ? Math.round((totalPago / totalMes) * 100) : 0;

  return {
    totalMes,
    totalPago,
    totalPendente,
    totalAtrasado,
    countTotal,
    countPago,
    countPendente,
    countAtrasado,
    percentualPago,
  };
}

export async function createPayable(data: PayableFormData): Promise<Payable[]> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const nowStr = new Date().toISOString();
  const createdItems: Payable[] = [];

  const isInstallments = Boolean(data.parcelado && (data.totalParcelas || 1) > 1);
  const totalParcelas = isInstallments ? data.totalParcelas! : 1;
  const grupoId = isInstallments ? `grp-pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` : undefined;

  // IMPORTANT: Divide total amount across installments
  // Ex: Total R$ 1.200 (120000 cents) / 12 = R$ 100 per month (10000 cents)
  const totalCents = data.valor;
  const baseParcelaCents = Math.floor(totalCents / totalParcelas);
  const remainderCents = totalCents - baseParcelaCents * totalParcelas;

  const baseDateParts = data.dataVencimento.split('-');
  const baseYear = parseInt(baseDateParts[0], 10);
  const baseMonth = parseInt(baseDateParts[1], 10) - 1; // 0-indexed
  const baseDay = parseInt(baseDateParts[2], 10);

  if (isInstallments) {
    for (let i = 0; i < totalParcelas; i++) {
      const parcelaNum = i + 1;
      const valorParcela = baseParcelaCents + (i < remainderCents ? 1 : 0);

      // Advance by i months
      const targetDate = new Date(baseYear, baseMonth + i, baseDay);
      // Handle day mismatch when target month has fewer days (e.g. 31 on Feb)
      if (targetDate.getDate() !== baseDay && targetDate.getMonth() !== (baseMonth + i) % 12) {
        targetDate.setDate(0);
      }
      const dataVencimentoIso = targetDate.toISOString().split('T')[0];
      const desc = `${data.descricao} (${parcelaNum}/${totalParcelas})`;

      const newItem: Payable = {
        id: `pay-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        userId: 1,
        descricao: desc,
        valor: valorParcela,
        valorPago: i === 0 && data.status === 'Pago' ? valorParcela : null,
        categoria: data.categoria,
        dataVencimento: dataVencimentoIso,
        dataPagamento: i === 0 && data.status === 'Pago' ? new Date().toISOString().split('T')[0] : null,
        formaPagamento: data.formaPagamento,
        status: i === 0 ? data.status : 'Pendente',
        observacao: data.observacao,
        recorrente: false,
        parcelado: true,
        parcelaNumero: parcelaNum,
        totalParcelas: totalParcelas,
        grupoParcelamentoId: grupoId,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      createdItems.push(newItem);
    }
  } else if (data.recorrente && data.frequenciaRecorrencia) {
    // Generate the first record plus next 5 future occurrences for smooth calendar management
    const freqCount = data.frequenciaRecorrencia === 'Semanal' ? 8 : data.frequenciaRecorrencia === 'Quinzenal' ? 6 : data.frequenciaRecorrencia === 'Mensal' ? 6 : 2;
    const recurrenceGroup = `rec-pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    for (let i = 0; i < freqCount; i++) {
      let targetDate = new Date(baseYear, baseMonth, baseDay);

      if (data.frequenciaRecorrencia === 'Semanal') {
        targetDate.setDate(baseDay + i * 7);
      } else if (data.frequenciaRecorrencia === 'Quinzenal') {
        targetDate.setDate(baseDay + i * 15);
      } else if (data.frequenciaRecorrencia === 'Mensal') {
        targetDate = new Date(baseYear, baseMonth + i, baseDay);
        if (targetDate.getDate() !== baseDay && targetDate.getMonth() !== (baseMonth + i) % 12) {
          targetDate.setDate(0);
        }
      } else if (data.frequenciaRecorrencia === 'Anual') {
        targetDate = new Date(baseYear + i, baseMonth, baseDay);
      }

      const dataVencimentoIso = targetDate.toISOString().split('T')[0];

      const newItem: Payable = {
        id: `pay-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        userId: 1,
        descricao: data.descricao,
        valor: data.valor,
        valorPago: i === 0 && data.status === 'Pago' ? data.valor : null,
        categoria: data.categoria,
        dataVencimento: dataVencimentoIso,
        dataPagamento: i === 0 && data.status === 'Pago' ? new Date().toISOString().split('T')[0] : null,
        formaPagamento: data.formaPagamento,
        status: i === 0 ? data.status : 'Pendente',
        observacao: data.observacao,
        recorrente: true,
        frequenciaRecorrencia: data.frequenciaRecorrencia,
        parcelado: false,
        grupoParcelamentoId: recurrenceGroup,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      createdItems.push(newItem);
    }
  } else {
    // Single normal payable
    const newItem: Payable = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: 1,
      descricao: data.descricao,
      valor: data.valor,
      valorPago: data.status === 'Pago' ? data.valor : null,
      categoria: data.categoria,
      dataVencimento: data.dataVencimento,
      dataPagamento: data.status === 'Pago' ? (data.dataPagamento || new Date().toISOString().split('T')[0]) : null,
      formaPagamento: data.formaPagamento,
      status: data.status,
      observacao: data.observacao,
      recorrente: false,
      parcelado: false,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    createdItems.push(newItem);
  }

  const updated = [...all, ...createdItems];
  saveStoredData(updated);

  return createdItems;
}

export async function updatePayable(id: string, data: Partial<PayableFormData>): Promise<Payable> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Conta a pagar não encontrada.');
  }

  const current = all[index];
  const updatedItem: Payable = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveStoredData(all);

  return updatedItem;
}

export async function updatePayableAndFuture(
  id: string,
  data: Partial<PayableFormData>
): Promise<Payable[]> {
  await new Promise((res) => setTimeout(res, 200));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error('Conta a pagar não encontrada.');

  if (!target.grupoParcelamentoId) {
    const updated = await updatePayable(id, data);
    return [updated];
  }

  const currentParcela = target.parcelaNumero || 1;
  const updatedList: Payable[] = [];

  const newAll = all.map((item) => {
    if (
      item.grupoParcelamentoId === target.grupoParcelamentoId &&
      (item.parcelaNumero || 0) >= currentParcela
    ) {
      const newItem: Payable = {
        ...item,
        categoria: data.categoria ?? item.categoria,
        formaPagamento: data.formaPagamento ?? item.formaPagamento,
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

export async function deletePayable(id: string): Promise<void> {
  await new Promise((res) => setTimeout(res, 100));

  const all = getStoredData();
  const filtered = all.filter((r) => r.id !== id);
  saveStoredData(filtered);
}

export async function deletePayableAndFuture(id: string): Promise<void> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) return;

  if (!target.grupoParcelamentoId) {
    return deletePayable(id);
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

export async function markAsPaid(id: string, dataPagamento?: string): Promise<Payable> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Conta a pagar não encontrada');

  const current = all[index];
  // Idempotency check: if already paid, return
  if (current.status === 'Pago') return current;

  const todayStr = dataPagamento || new Date().toISOString().split('T')[0];
  const updatedItem: Payable = {
    ...current,
    status: 'Pago',
    dataPagamento: todayStr,
    valorPago: current.valor,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveStoredData(all);

  return updatedItem;
}

export async function duplicatePayable(id: string): Promise<Payable> {
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error('Conta a pagar não encontrada');

  const nowStr = new Date().toISOString();
  const clone: Payable = {
    ...target,
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    descricao: `${target.descricao} (Cópia)`,
    status: 'Pendente',
    valorPago: null,
    dataPagamento: null,
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

export async function getAllPayables(): Promise<Payable[]> {
  return getStoredData().map(normalizeStatus);
}
