import {
  BankAccount,
  AccountTransaction,
  CreateAccountFormData,
  UpdateBalanceData,
  TransferFundsData,
  AddTransactionData,
  ReconciliationSuggestion,
  KNOWN_INSTITUTIONS,
  AccountType,
} from './account-types';

const STORAGE_ACCOUNTS = 'arca_bank_accounts_v1';
const STORAGE_TRANSACTIONS = 'arca_bank_account_transactions_v1';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function getInitialAccounts(): BankAccount[] {
  const now = new Date();
  const twelveMinutesAgo = new Date(now.getTime() - 12 * 60 * 1000).toISOString();

  return [
    {
      id: 'acc-nubank',
      userId: 1,
      nome: 'Conta principal',
      instituicao: 'Nubank',
      instituicaoKey: 'nubank',
      tipo: 'corrente',
      saldo: 285000, // R$ 2.850,00
      origem: 'manual',
      statusConexao: null,
      ultimaSincronizacao: null,
      agencia: '0001',
      numeroConta: '****2849',
      digito: '7',
      observacao: 'Conta para movimentações do dia a dia e Pix',
      cor: '#820AD1',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acc-itau',
      userId: 1,
      nome: 'Itaú Uniclass',
      instituicao: 'Itaú',
      instituicaoKey: 'itau',
      tipo: 'corrente',
      saldo: 421050, // R$ 4.210,50
      origem: 'open_finance',
      statusConexao: 'conectado',
      ultimaSincronizacao: twelveMinutesAgo,
      agencia: '3812',
      numeroConta: '****1940',
      digito: '3',
      observacao: 'Conta salário e débito automático',
      cor: '#EC7000',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acc-inter',
      userId: 1,
      nome: 'Inter Reserva',
      instituicao: 'Inter',
      instituicaoKey: 'inter',
      tipo: 'digital',
      saldo: 150000, // R$ 1.500,00
      origem: 'open_finance',
      statusConexao: 'conectado',
      ultimaSincronizacao: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      agencia: '0001',
      numeroConta: '****9921',
      digito: '0',
      observacao: 'Conta digital sem tarifas',
      cor: '#FF7A00',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acc-carteira',
      userId: 1,
      nome: 'Carteira física',
      instituicao: 'Dinheiro / Carteira',
      instituicaoKey: 'dinheiro',
      tipo: 'carteira',
      saldo: 32000, // R$ 320,00
      origem: 'manual',
      statusConexao: null,
      ultimaSincronizacao: null,
      observacao: 'Notas e moedas em espécie',
      cor: '#10B981',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getInitialTransactions(): AccountTransaction[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 24 * 3600 * 1000).toISOString().split('T')[0];
  const twoDaysAgoStr = new Date(now.getTime() - 48 * 3600 * 1000).toISOString().split('T')[0];

  return [
    {
      id: 'tx-1',
      contaId: 'acc-nubank',
      tipo: 'receita',
      valor: 150000, // R$ 1.500,00
      descricao: 'Recebimento Pix - Miquéias Consultoria',
      categoria: 'Serviços',
      data: todayStr,
      origem: 'manual',
      conciliado: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      contaId: 'acc-nubank',
      tipo: 'despesa',
      valor: 8590, // R$ 85,90
      descricao: 'Supermercado Pão de Açúcar',
      categoria: 'Alimentação',
      data: yesterdayStr,
      origem: 'manual',
      conciliado: false,
      possivelDuplicidade: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      contaId: 'acc-itau',
      tipo: 'despesa',
      valor: 8590, // R$ 85,90 (Matching tx-2 for reconciliation demo!)
      descricao: 'PAO DE ACUCAR LJ 1492 SAO PAULO BR',
      categoria: 'Supermercado',
      data: yesterdayStr,
      origem: 'open_finance',
      externalId: 'of-tx-paoacucar-992',
      conciliado: false,
      possivelDuplicidade: true,
      duplicataSugeridaId: 'tx-2',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-4',
      contaId: 'acc-itau',
      tipo: 'receita',
      valor: 500000, // R$ 5.000,00
      descricao: 'TED TED 033 TED RECEBIDA SALARIO',
      categoria: 'Salário',
      data: twoDaysAgoStr,
      origem: 'open_finance',
      externalId: 'of-tx-salario-441',
      conciliado: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      contaId: 'acc-inter',
      tipo: 'receita',
      valor: 50000, // R$ 500,00
      descricao: 'Rendimento CDB Liquidez Diária',
      categoria: 'Investimentos',
      data: yesterdayStr,
      origem: 'open_finance',
      externalId: 'of-tx-cdb-302',
      conciliado: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function loadAccounts(): BankAccount[] {
  if (typeof window === 'undefined') return getInitialAccounts();
  const raw = localStorage.getItem(STORAGE_ACCOUNTS);
  if (!raw) {
    const initial = getInitialAccounts();
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return getInitialAccounts();
  }
}

function saveAccounts(accounts: BankAccount[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
}

function loadTransactions(): AccountTransaction[] {
  if (typeof window === 'undefined') return getInitialTransactions();
  const raw = localStorage.getItem(STORAGE_TRANSACTIONS);
  if (!raw) {
    const initial = getInitialTransactions();
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return getInitialTransactions();
  }
}

function saveTransactions(transactions: AccountTransaction[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(transactions));
}

// ----------------- API Methods -----------------

export async function fetchAccounts(): Promise<BankAccount[]> {
  await delay(60);
  return loadAccounts();
}

export async function fetchAccountById(id: string): Promise<BankAccount | undefined> {
  await delay(40);
  const accounts = loadAccounts();
  return accounts.find((a) => a.id === id);
}

export async function createAccount(data: CreateAccountFormData): Promise<BankAccount> {
  await delay(150);
  const accounts = loadAccounts();

  const institutionPreset = KNOWN_INSTITUTIONS.find(
    (i) => i.key === data.instituicaoKey || i.nome.toLowerCase() === data.instituicao.toLowerCase()
  );

  const corFinal = data.cor || institutionPreset?.cor || '#64748B';

  const newAccount: BankAccount = {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: 1,
    nome: data.nome.trim(),
    instituicao: data.instituicao.trim(),
    instituicaoKey: data.instituicaoKey || 'outro',
    tipo: data.tipo,
    saldo: data.saldoInicialCents || 0,
    origem: 'manual',
    statusConexao: null,
    ultimaSincronizacao: null,
    agencia: data.agencia?.trim() || undefined,
    numeroConta: data.numeroConta ? `****${data.numeroConta.slice(-4)}` : undefined,
    digito: data.digito?.trim() || undefined,
    observacao: data.observacao?.trim() || undefined,
    cor: corFinal,
    icone: data.icone,
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  accounts.unshift(newAccount);
  saveAccounts(accounts);

  // If initial balance > 0, record initial adjustment transaction
  if (data.saldoInicialCents > 0) {
    const transactions = loadTransactions();
    transactions.unshift({
      id: `tx-init-${Date.now()}`,
      contaId: newAccount.id,
      tipo: 'ajuste_saldo',
      valor: data.saldoInicialCents,
      descricao: 'Saldo inicial cadastrado',
      categoria: 'Saldo inicial',
      data: new Date().toISOString().split('T')[0],
      origem: 'manual',
      conciliado: true,
      createdAt: new Date().toISOString(),
    });
    saveTransactions(transactions);
  }

  return newAccount;
}

export async function updateAccount(
  id: string,
  data: Partial<CreateAccountFormData>
): Promise<BankAccount> {
  await delay(120);
  const accounts = loadAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Conta bancária não encontrada.');

  const existing = accounts[index];
  const updated: BankAccount = {
    ...existing,
    nome: data.nome !== undefined ? data.nome.trim() : existing.nome,
    instituicao: data.instituicao !== undefined ? data.instituicao.trim() : existing.instituicao,
    instituicaoKey: data.instituicaoKey || existing.instituicaoKey,
    tipo: data.tipo || existing.tipo,
    agencia: data.agencia !== undefined ? data.agencia.trim() : existing.agencia,
    numeroConta: data.numeroConta !== undefined ? data.numeroConta : existing.numeroConta,
    digito: data.digito !== undefined ? data.digito.trim() : existing.digito,
    observacao: data.observacao !== undefined ? data.observacao.trim() : existing.observacao,
    cor: data.cor || existing.cor,
    icone: data.icone || existing.icone,
    updatedAt: new Date().toISOString(),
  };

  accounts[index] = updated;
  saveAccounts(accounts);
  return updated;
}

export async function deleteAccount(id: string): Promise<void> {
  await delay(100);
  const accounts = loadAccounts();
  const filtered = accounts.filter((a) => a.id !== id);
  saveAccounts(filtered);

  // Also clean transactions
  const transactions = loadTransactions();
  const filteredTx = transactions.filter((t) => t.contaId !== id);
  saveTransactions(filteredTx);
}

export async function updateAccountBalance(data: UpdateBalanceData): Promise<BankAccount> {
  await delay(120);
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === data.contaId);
  if (!account) throw new Error('Conta bancária não encontrada.');

  const diff = data.novoSaldoCents - account.saldo;
  account.saldo = data.novoSaldoCents;
  account.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  // Record adjustment transaction
  if (diff !== 0) {
    const transactions = loadTransactions();
    transactions.unshift({
      id: `tx-adj-${Date.now()}`,
      contaId: account.id,
      tipo: 'ajuste_saldo',
      valor: Math.abs(diff),
      descricao: data.observacao?.trim() || `Ajuste manual de saldo (${diff > 0 ? '+' : ''}${(diff / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
      categoria: 'Ajuste de saldo',
      data: new Date().toISOString().split('T')[0],
      origem: 'manual',
      conciliado: true,
      createdAt: new Date().toISOString(),
    });
    saveTransactions(transactions);
  }

  return account;
}

export async function transferFunds(data: TransferFundsData): Promise<{
  origem: BankAccount;
  destino: BankAccount;
}> {
  await delay(150);
  const accounts = loadAccounts();
  const origem = accounts.find((a) => a.id === data.contaOrigemId);
  const destino = accounts.find((a) => a.id === data.contaDestinoId);

  if (!origem || !destino) {
    throw new Error('Contas de origem ou destino inválidas.');
  }

  if (origem.id === destino.id) {
    throw new Error('A conta de origem e destino devem ser diferentes.');
  }

  if (data.valorCents <= 0) {
    throw new Error('O valor da transferência deve ser maior que zero.');
  }

  // Update balances
  origem.saldo -= data.valorCents;
  destino.saldo += data.valorCents;
  origem.updatedAt = new Date().toISOString();
  destino.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  // Record internal transfer transactions linked by transferenciaId
  const transferenciaId = `trf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const desc = data.descricao?.trim() || 'Transferência entre contas';

  const transactions = loadTransactions();
  transactions.unshift({
    id: `tx-out-${Date.now()}`,
    contaId: origem.id,
    tipo: 'transferencia_saida',
    valor: data.valorCents,
    descricao: `${desc} para ${destino.nome}`,
    categoria: 'Transferência interna',
    data: data.data || new Date().toISOString().split('T')[0],
    origem: 'manual',
    transferenciaId,
    contaDestinoId: destino.id,
    contaDestinoNome: destino.nome,
    conciliado: true,
    createdAt: new Date().toISOString(),
  });

  transactions.unshift({
    id: `tx-in-${Date.now() + 1}`,
    contaId: destino.id,
    tipo: 'transferencia_entrada',
    valor: data.valorCents,
    descricao: `${desc} de ${origem.nome}`,
    categoria: 'Transferência interna',
    data: data.data || new Date().toISOString().split('T')[0],
    origem: 'manual',
    transferenciaId,
    contaDestinoId: origem.id,
    contaDestinoNome: origem.nome,
    conciliado: true,
    createdAt: new Date().toISOString(),
  });

  saveTransactions(transactions);

  return { origem, destino };
}

export async function addAccountTransaction(
  data: AddTransactionData
): Promise<AccountTransaction> {
  await delay(120);
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === data.contaId);
  if (!account) throw new Error('Conta bancária não encontrada.');

  // Update balance accordingly
  if (data.tipo === 'receita') {
    account.saldo += data.valorCents;
  } else if (data.tipo === 'despesa') {
    account.saldo -= data.valorCents;
  } else if (data.tipo === 'ajuste_saldo') {
    account.saldo = data.valorCents;
  }
  account.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  const transactions = loadTransactions();
  const newTx: AccountTransaction = {
    id: `tx-manual-${Date.now()}`,
    contaId: data.contaId,
    tipo: data.tipo,
    valor: data.valorCents,
    descricao: data.descricao.trim(),
    categoria: data.categoria || 'Geral',
    data: data.data || new Date().toISOString().split('T')[0],
    origem: 'manual',
    conciliado: true,
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(newTx);
  saveTransactions(transactions);

  return newTx;
}

// ----------------- Open Finance Integration -----------------

export async function connectOpenFinance(
  institutionKey: string,
  nomeCustom?: string,
  tipo: AccountType = 'corrente'
): Promise<BankAccount> {
  await delay(800); // Simulate network & security auth handshake
  const accounts = loadAccounts();

  const institution = KNOWN_INSTITUTIONS.find((i) => i.key === institutionKey);
  if (!institution) throw new Error('Instituição não suportada pelo Open Finance.');

  // Mock initial imported balance between R$ 1.200,00 and R$ 8.500,00
  const randomCents = Math.floor(Math.random() * 730000) + 120000;
  const now = new Date();

  const newAccount: BankAccount = {
    id: `acc-of-${Date.now()}`,
    userId: 1,
    nome: nomeCustom?.trim() || `${institution.nome} Digital`,
    instituicao: institution.nome,
    instituicaoKey: institution.key,
    tipo,
    saldo: randomCents,
    origem: 'open_finance',
    statusConexao: 'conectado',
    ultimaSincronizacao: now.toISOString(),
    agencia: String(Math.floor(Math.random() * 8999) + 1000),
    numeroConta: `****${Math.floor(Math.random() * 8999) + 1000}`,
    digito: String(Math.floor(Math.random() * 9)),
    cor: institution.cor,
    ativo: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  accounts.unshift(newAccount);
  saveAccounts(accounts);

  // Import mock recent transactions from Open Finance
  const transactions = loadTransactions();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 24 * 3600 * 1000).toISOString().split('T')[0];

  transactions.unshift(
    {
      id: `tx-of-${Date.now()}-1`,
      contaId: newAccount.id,
      tipo: 'receita',
      valor: 250000,
      descricao: `Pix recebido - ${institution.nome}`,
      categoria: 'Transferência Pix',
      data: todayStr,
      origem: 'open_finance',
      externalId: `of-ext-${Date.now()}-1`,
      conciliado: true,
      createdAt: now.toISOString(),
    },
    {
      id: `tx-of-${Date.now()}-2`,
      contaId: newAccount.id,
      tipo: 'despesa',
      valor: 4590,
      descricao: 'Pagamento de boleto - Conectividade',
      categoria: 'Serviços',
      data: yesterdayStr,
      origem: 'open_finance',
      externalId: `of-ext-${Date.now()}-2`,
      conciliado: true,
      createdAt: now.toISOString(),
    }
  );
  saveTransactions(transactions);

  return newAccount;
}

export async function syncOpenFinanceAccount(id: string): Promise<BankAccount> {
  await delay(600);
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === id);
  if (!account) throw new Error('Conta não encontrada.');

  account.ultimaSincronizacao = new Date().toISOString();
  account.statusConexao = 'conectado';
  account.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  return account;
}

export async function reconnectOpenFinanceAccount(id: string): Promise<BankAccount> {
  await delay(700);
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === id);
  if (!account) throw new Error('Conta não encontrada.');

  account.statusConexao = 'conectado';
  account.ultimaSincronizacao = new Date().toISOString();
  account.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  return account;
}

// ----------------- Transactions & Reconciliation -----------------

export async function fetchAccountTransactions(
  contaId?: string
): Promise<AccountTransaction[]> {
  await delay(50);
  const all = loadTransactions();
  if (!contaId || contaId === 'todas') {
    return all.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }
  return all
    .filter((t) => t.contaId === contaId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export async function fetchReconciliationSuggestions(): Promise<ReconciliationSuggestion[]> {
  await delay(80);
  const transactions = loadTransactions();
  const manuals = transactions.filter((t) => t.origem === 'manual' && !t.conciliado);
  const openFinances = transactions.filter((t) => t.origem === 'open_finance' && !t.conciliado);

  const suggestions: ReconciliationSuggestion[] = [];

  for (const man of manuals) {
    for (const of of openFinances) {
      // Check if values match exactly
      if (man.valor === of.valor && (man.tipo === of.tipo || (man.tipo === 'despesa' && of.tipo === 'despesa'))) {
        const dMan = new Date(man.data).getTime();
        const dOf = new Date(of.data).getTime();
        const diffDays = Math.round(Math.abs(dMan - dOf) / (1000 * 3600 * 24));

        // If within 3 days tolerance
        if (diffDays <= 3) {
          suggestions.push({
            id: `rec-${man.id}-${of.id}`,
            manualTransaction: man,
            openFinanceTransaction: of,
            diferencaDias: diffDays,
            percentualMatch: diffDays === 0 ? 98 : 85,
          });
        }
      }
    }
  }

  return suggestions;
}

export async function resolveReconciliation(
  manualTxId: string,
  openFinanceTxId: string,
  action: 'keep_both' | 'merge'
): Promise<void> {
  await delay(100);
  const transactions = loadTransactions();
  const manIndex = transactions.findIndex((t) => t.id === manualTxId);
  const ofIndex = transactions.findIndex((t) => t.id === openFinanceTxId);

  if (action === 'keep_both') {
    if (manIndex !== -1) {
      transactions[manIndex].conciliado = true;
      transactions[manIndex].possivelDuplicidade = false;
    }
    if (ofIndex !== -1) {
      transactions[ofIndex].conciliado = true;
      transactions[ofIndex].possivelDuplicidade = false;
    }
  } else if (action === 'merge') {
    // Keep open finance official transaction enriched with manual category & description
    if (manIndex !== -1 && ofIndex !== -1) {
      const manual = transactions[manIndex];
      transactions[ofIndex].categoria = manual.categoria || transactions[ofIndex].categoria;
      transactions[ofIndex].conciliado = true;
      transactions[ofIndex].possivelDuplicidade = false;

      // Remove the duplicate manual one so balance isn't double-counted
      transactions.splice(manIndex, 1);
    }
  }

  saveTransactions(transactions);
}

// ----------------- External System Integrations -----------------

export async function applyExpenseDebit(
  contaId: string,
  amountCents: number,
  descricao: string
): Promise<void> {
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === contaId);
  if (!account) return;

  account.saldo -= amountCents;
  account.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  const transactions = loadTransactions();
  transactions.unshift({
    id: `tx-exp-${Date.now()}`,
    contaId: account.id,
    tipo: 'despesa',
    valor: amountCents,
    descricao,
    data: new Date().toISOString().split('T')[0],
    origem: 'manual',
    conciliado: true,
    createdAt: new Date().toISOString(),
  });
  saveTransactions(transactions);
}

export async function applyIncomeCredit(
  contaId: string,
  amountCents: number,
  descricao: string
): Promise<void> {
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === contaId);
  if (!account) return;

  account.saldo += amountCents;
  account.updatedAt = new Date().toISOString();
  saveAccounts(accounts);

  const transactions = loadTransactions();
  transactions.unshift({
    id: `tx-inc-${Date.now()}`,
    contaId: account.id,
    tipo: 'receita',
    valor: amountCents,
    descricao,
    data: new Date().toISOString().split('T')[0],
    origem: 'manual',
    conciliado: true,
    createdAt: new Date().toISOString(),
  });
  saveTransactions(transactions);
}
