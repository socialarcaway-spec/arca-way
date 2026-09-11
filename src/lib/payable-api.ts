import {
  Payable,
  PayableFilters,
  PayableFormData,
  PayableSummary,
} from './payable-types';

const STORAGE_KEY = 'arca_monthly_payables_v2';

// Seed initial sample data if localStorage is empty
// Exclusively fixed, recurring, or installment commitments (NO daily expenses)
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
      categoria: 'Energia',
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
      descricao: 'Água e Saneamento - Sabesp',
      valor: 9480, // R$ 94,80
      valorPago: 9480,
      categoria: 'Água',
      dataVencimento: dStr(currentYear, currentMonth, 6),
      dataPagamento: dStr(currentYear, currentMonth, 6),
      formaPagamento: 'Débito Automático',
      status: 'Pago',
      observacao: 'Débito em conta corrente',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-4',
      userId: 1,
      descricao: 'Internet Fibra 600MB',
      valor: 12000, // R$ 120,00
      valorPago: 12000,
      categoria: 'Internet',
      dataVencimento: dStr(currentYear, currentMonth, 10),
      dataPagamento: dStr(currentYear, currentMonth, 9),
      formaPagamento: 'Débito Automático',
      status: 'Pago',
      observacao: 'Plano fibra residencial',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-5',
      userId: 1,
      descricao: 'Plano Celular Pós 5G',
      valor: 6990, // R$ 69,90
      valorPago: null,
      categoria: 'Telefone',
      dataVencimento: dStr(currentYear, currentMonth, 15),
      dataPagamento: null,
      formaPagamento: 'Pix',
      status: 'Pendente',
      observacao: 'Linha titular Claro',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-6',
      userId: 1,
      descricao: 'Financiamento Imobiliário Caixa',
      valor: 165000, // R$ 1.650,00
      valorPago: null,
      categoria: 'Financiamento',
      dataVencimento: dStr(currentYear, currentMonth, 20),
      dataPagamento: null,
      formaPagamento: 'Débito Automático',
      status: 'Pendente',
      observacao: 'Parcela 48 de 360 do imóvel',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-7',
      userId: 1,
      descricao: 'Seguro Automóvel Porto Seguro',
      valor: 23500, // R$ 235,00
      valorPago: null,
      categoria: 'Seguro',
      dataVencimento: dStr(currentYear, currentMonth, 22),
      dataPagamento: null,
      formaPagamento: 'Cartão de Crédito',
      status: 'Pendente',
      observacao: 'Apólice veículo 2026',
      recorrente: true,
      frequenciaRecorrencia: 'Mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-8',
      userId: 1,
      descricao: 'Fatura Cartão de Crédito',
      valor: 98000, // R$ 980,00
      valorPago: null,
      categoria: 'Cartão',
      dataVencimento: dStr(currentYear, currentMonth, 2),
      dataPagamento: null,
      formaPagamento: 'Pix',
      status: 'Atrasado',
      observacao: 'Fatura fechada dia 25',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-9',
      userId: 1,
      descricao: 'Notebook Dell XPS (1/10)',
      valor: 35000, // R$ 350,00 (Total R$ 3.500 em 10x)
      valorPago: null,
      categoria: 'Cartão',
      dataVencimento: dStr(currentYear, currentMonth, 18),
      dataPagamento: null,
      formaPagamento: 'Cartão de Crédito',
      status: 'Pendente',
      observacao: 'Compra parcelada em 10x sem juros',
      parcelado: true,
      parcelaNumero: 1,
      totalParcelas: 10,
      grupoParcelamentoId: 'grp-notebook-dell',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-10',
      userId: 1,
      descricao: 'Notebook Dell XPS (2/10)',
      valor: 35000, // R$ 350,00 da parcela
      valorPago: null,
      categoria: 'Cartão',
      dataVencimento: dStr(currentYear, currentMonth + 1, 18),
      dataPagamento: null,
      formaPagamento: 'Cartão de Crédito',
      status: 'Pendente',
      observacao: 'Segunda parcela do notebook',
      parcelado: true,
      parcelaNumero: 2,
      totalParcelas: 10,
      grupoParcelamentoId: 'grp-notebook-dell',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pay-sample-11',
      userId: 1,
      descricao: 'Mensalidade Pós-Graduação',
      valor: 58000, // R$ 580,00
      valorPago: null,
      categoria: 'Educação',
      dataVencimento: dStr(currentYear, currentMonth, 28),
      dataPagamento: null,
      formaPagamento: 'Boleto',
      status: 'Pendente',
      observacao: 'Curso de Especialização',
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
  await new Promise((res) => setTimeout(res, 80));

  let items = getStoredData().map(normalizeStatus);

  // Month & Year Filter - STRICTLY filter by month of vencimento
  if (filters.month !== undefined && filters.year !== undefined) {
    items = items.filter((item) => {
      const parts = item.dataVencimento.split('-');
      if (parts.length < 2) return true;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return y === filters.year && m === filters.month;
    });
  }

  // Quick Filter Tabs (Todas, Pendentes, Pagas, Vencidas, Recorrentes, Parceladas)
  if (filters.quickFilter && filters.quickFilter !== 'Todas') {
    switch (filters.quickFilter) {
      case 'Pendentes':
        items = items.filter((item) => item.status === 'Pendente');
        break;
      case 'Pagas':
        items = items.filter((item) => item.status === 'Pago');
        break;
      case 'Vencidas':
        items = items.filter((item) => item.status === 'Atrasado');
        break;
      case 'Recorrentes':
        items = items.filter((item) => Boolean(item.recorrente));
        break;
      case 'Parceladas':
        items = items.filter((item) => Boolean(item.parcelado));
        break;
    }
  } else if (filters.status && filters.status !== 'Todos') {
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

  // Explicit Recorrente / Parcelado Filter (if set outside quickFilter)
  if (filters.recorrente !== undefined && !filters.quickFilter) {
    items = items.filter((item) => Boolean(item.recorrente) === filters.recorrente);
  }
  if (filters.parcelado !== undefined && !filters.quickFilter) {
    items = items.filter((item) => Boolean(item.parcelado) === filters.parcelado);
  }

  // Search Filter (Nome/Descrição, Categoria, Observação)
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
    switch (sortBy) {
      case 'vencimento':
        return a.dataVencimento.localeCompare(b.dataVencimento);
      case 'vencimento_desc':
        return b.dataVencimento.localeCompare(a.dataVencimento);
      case 'valor_desc':
        return b.valor - a.valor;
      case 'valor_asc':
        return a.valor - b.valor;
      case 'descricao':
        return a.descricao.localeCompare(b.descricao);
      case 'recentes':
        return b.createdAt.localeCompare(a.createdAt);
      case 'antigas':
        return a.createdAt.localeCompare(b.createdAt);
      case 'vencidas_primeiro': {
        const orderWeight: Record<string, number> = { Atrasado: 0, Pendente: 1, Pago: 2 };
        const weightA = orderWeight[a.status] ?? 1;
        const weightB = orderWeight[b.status] ?? 1;
        if (weightA !== weightB) return weightA - weightB;
        return a.dataVencimento.localeCompare(b.dataVencimento);
      }
      default:
        return sortOrder === 'asc'
          ? a.dataVencimento.localeCompare(b.dataVencimento)
          : b.dataVencimento.localeCompare(a.dataVencimento);
    }
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
  await new Promise((res) => setTimeout(res, 120));

  const all = getStoredData();
  const nowStr = new Date().toISOString();
  const createdItems: Payable[] = [];

  const isInstallments =
    data.accountType === 'parcelada' ||
    Boolean(data.parcelado && (data.totalParcelas || 1) > 1);
  const isRecurring =
    data.accountType === 'recorrente' || (!isInstallments && Boolean(data.recorrente));

  const totalParcelas = isInstallments ? Math.max(2, data.totalParcelas || 2) : 1;
  const grupoId = isInstallments
    ? `grp-pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    : undefined;

  // RULE: Divide total amount across installments without losing cents
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
      // Handle day mismatch (e.g. day 31 on Feb)
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
        dataPagamento:
          i === 0 && data.status === 'Pago'
            ? new Date().toISOString().split('T')[0]
            : null,
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
  } else if (isRecurring) {
    const freq = data.frequenciaRecorrencia || 'Mensal';
    // Generate the first record plus 11 future occurrences (1 full year)
    const freqCount = freq === 'Semanal' ? 12 : freq === 'Quinzenal' ? 12 : freq === 'Mensal' ? 12 : 2;
    const recurrenceGroup = `rec-pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    for (let i = 0; i < freqCount; i++) {
      let targetDate = new Date(baseYear, baseMonth, baseDay);

      if (freq === 'Semanal') {
        targetDate.setDate(baseDay + i * 7);
      } else if (freq === 'Quinzenal') {
        targetDate.setDate(baseDay + i * 15);
      } else if (freq === 'Mensal') {
        targetDate = new Date(baseYear, baseMonth + i, baseDay);
        if (targetDate.getDate() !== baseDay && targetDate.getMonth() !== (baseMonth + i) % 12) {
          targetDate.setDate(0);
        }
      } else if (freq === 'Anual') {
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
        dataPagamento:
          i === 0 && data.status === 'Pago'
            ? new Date().toISOString().split('T')[0]
            : null,
        formaPagamento: data.formaPagamento,
        status: i === 0 ? data.status : 'Pendente',
        observacao: data.observacao,
        recorrente: true,
        frequenciaRecorrencia: freq,
        parcelado: false,
        grupoParcelamentoId: recurrenceGroup,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      createdItems.push(newItem);
    }
  } else {
    // Single normal payable (exists only in this period)
    const newItem: Payable = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: 1,
      descricao: data.descricao,
      valor: data.valor,
      valorPago: data.status === 'Pago' ? data.valor : null,
      categoria: data.categoria,
      dataVencimento: data.dataVencimento,
      dataPagamento:
        data.status === 'Pago'
          ? data.dataPagamento || new Date().toISOString().split('T')[0]
          : null,
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

export async function updatePayable(
  id: string,
  data: Partial<PayableFormData>
): Promise<Payable> {
  await new Promise((res) => setTimeout(res, 120));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error('Conta a pagar não encontrada.');
  }

  const current = all[index];
  const updatedItem: Payable = {
    ...current,
    descricao: data.descricao ?? current.descricao,
    valor: data.valor ?? current.valor,
    categoria: data.categoria ?? current.categoria,
    dataVencimento: data.dataVencimento ?? current.dataVencimento,
    formaPagamento: data.formaPagamento ?? current.formaPagamento,
    status: data.status ?? current.status,
    observacao: data.observacao ?? current.observacao,
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
  await new Promise((res) => setTimeout(res, 150));

  const all = getStoredData();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error('Conta a pagar não encontrada.');

  if (!target.grupoParcelamentoId) {
    const updated = await updatePayable(id, data);
    return [updated];
  }

  const currentParcela = target.parcelaNumero || 1;
  const targetDate = target.dataVencimento;
  const updatedList: Payable[] = [];

  const newAll = all.map((item) => {
    // Match parcelamento group OR recurrence group
    const isSameGroup = item.grupoParcelamentoId === target.grupoParcelamentoId;
    const isCurrentOrFuture = target.parcelado
      ? (item.parcelaNumero || 0) >= currentParcela
      : item.dataVencimento >= targetDate;

    if (isSameGroup && isCurrentOrFuture) {
      const newItem = {
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
  const targetDate = target.dataVencimento;

  const filtered = all.filter((item) => {
    if (item.grupoParcelamentoId !== target.grupoParcelamentoId) return true;
    if (target.parcelado) {
      return (item.parcelaNumero || 0) < currentParcela;
    }
    return item.dataVencimento < targetDate;
  });

  saveStoredData(filtered);
}

export async function markAsPaid(id: string, customDate?: string): Promise<Payable> {
  await new Promise((res) => setTimeout(res, 120));

  const all = getStoredData();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Conta a pagar não encontrada');

  const current = all[index];
  // Anti-duplication / Idempotence rule: if already 'Pago', do not duplicate
  if (current.status === 'Pago') return current;

  const todayStr = customDate || new Date().toISOString().split('T')[0];
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
  await new Promise((res) => setTimeout(res, 100));

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
