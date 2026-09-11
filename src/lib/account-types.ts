export type AccountOrigin = 'manual' | 'open_finance';

export type AccountConnectionStatus =
  | 'conectado'
  | 'sincronizacao_necessaria'
  | 'expirado'
  | null;

export type AccountType =
  | 'corrente'
  | 'poupanca'
  | 'pagamento'
  | 'salario'
  | 'digital'
  | 'investimento'
  | 'carteira'
  | 'outra';

export const ACCOUNT_TYPES_LABELS: Record<AccountType, string> = {
  corrente: 'Conta corrente',
  poupanca: 'Conta poupança',
  pagamento: 'Conta pagamento',
  salario: 'Conta salário',
  digital: 'Conta digital',
  investimento: 'Conta de investimentos',
  carteira: 'Dinheiro/carteira',
  outra: 'Outra',
};

export interface BankAccount {
  id: string;
  userId?: number;
  nome: string;
  instituicao: string;
  instituicaoKey: string;
  tipo: AccountType;
  saldo: number; // in cents
  origem: AccountOrigin;
  statusConexao?: AccountConnectionStatus;
  ultimaSincronizacao?: string | null; // ISO Date string
  agencia?: string;
  numeroConta?: string;
  digito?: string;
  observacao?: string;
  cor: string; // Hex color
  icone?: string; // Icon identifier
  ativo: boolean;
  limiteDisponivel?: number; // Not summed into available balance
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'receita'
  | 'despesa'
  | 'transferencia_saida'
  | 'transferencia_entrada'
  | 'ajuste_saldo';

export interface AccountTransaction {
  id: string;
  contaId: string;
  tipo: TransactionType;
  valor: number; // in cents (always positive)
  descricao: string;
  categoria?: string;
  data: string; // ISO string (YYYY-MM-DD)
  origem: AccountOrigin;
  externalId?: string; // Open Finance transaction ID
  transferenciaId?: string;
  contaDestinoId?: string;
  contaDestinoNome?: string;
  conciliado?: boolean;
  possivelDuplicidade?: boolean;
  duplicataSugeridaId?: string;
  createdAt: string;
}

export interface BankInstitution {
  key: string;
  nome: string;
  cor: string;
  corTexto: string;
  bgBadge: string;
  logoIniciais: string;
  suportaOpenFinance: boolean;
}

export const KNOWN_INSTITUTIONS: BankInstitution[] = [
  {
    key: 'nubank',
    nome: 'Nubank',
    cor: '#820AD1',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#820AD1]/15 text-[#a855f7]',
    logoIniciais: 'Nu',
    suportaOpenFinance: true,
  },
  {
    key: 'itau',
    nome: 'Itaú',
    cor: '#EC7000',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#EC7000]/15 text-[#f97316]',
    logoIniciais: 'IT',
    suportaOpenFinance: true,
  },
  {
    key: 'banco-do-brasil',
    nome: 'Banco do Brasil',
    cor: '#0038A8',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#0038A8]/15 text-[#3b82f6]',
    logoIniciais: 'BB',
    suportaOpenFinance: true,
  },
  {
    key: 'bradesco',
    nome: 'Bradesco',
    cor: '#CC092F',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#CC092F]/15 text-[#ef4444]',
    logoIniciais: 'BR',
    suportaOpenFinance: true,
  },
  {
    key: 'santander',
    nome: 'Santander',
    cor: '#EA1D2C',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#EA1D2C]/15 text-[#f43f5e]',
    logoIniciais: 'SAN',
    suportaOpenFinance: true,
  },
  {
    key: 'caixa',
    nome: 'Caixa Econômica Federal',
    cor: '#005CA9',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#005CA9]/15 text-[#0284c7]',
    logoIniciais: 'CEF',
    suportaOpenFinance: true,
  },
  {
    key: 'inter',
    nome: 'Inter',
    cor: '#FF7A00',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#FF7A00]/15 text-[#fb923c]',
    logoIniciais: 'IN',
    suportaOpenFinance: true,
  },
  {
    key: 'c6-bank',
    nome: 'C6 Bank',
    cor: '#242424',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-zinc-700/20 text-zinc-300',
    logoIniciais: 'C6',
    suportaOpenFinance: true,
  },
  {
    key: 'picpay',
    nome: 'PicPay',
    cor: '#11C76F',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#11C76F]/15 text-[#10b981]',
    logoIniciais: 'PP',
    suportaOpenFinance: true,
  },
  {
    key: 'mercado-pago',
    nome: 'Mercado Pago',
    cor: '#009EE3',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#009EE3]/15 text-[#38bdf8]',
    logoIniciais: 'MP',
    suportaOpenFinance: true,
  },
  {
    key: 'pagbank',
    nome: 'PagBank',
    cor: '#00B175',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#00B175]/15 text-[#34d399]',
    logoIniciais: 'PB',
    suportaOpenFinance: true,
  },
  {
    key: 'btg-pactual',
    nome: 'BTG Pactual',
    cor: '#001E62',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#001E62]/15 text-[#60a5fa]',
    logoIniciais: 'BTG',
    suportaOpenFinance: true,
  },
  {
    key: 'sicredi',
    nome: 'Sicredi',
    cor: '#007A33',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#007A33]/15 text-[#22c55e]',
    logoIniciais: 'SIC',
    suportaOpenFinance: true,
  },
  {
    key: 'sicoob',
    nome: 'Sicoob',
    cor: '#003641',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-[#003641]/15 text-[#14b8a6]',
    logoIniciais: 'SCB',
    suportaOpenFinance: true,
  },
  {
    key: 'neon',
    nome: 'Neon',
    cor: '#00E5FF',
    corTexto: '#000000',
    bgBadge: 'bg-[#00E5FF]/15 text-[#06b6d4]',
    logoIniciais: 'NE',
    suportaOpenFinance: true,
  },
  {
    key: 'dinheiro',
    nome: 'Dinheiro / Carteira',
    cor: '#10B981',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-emerald-500/15 text-emerald-400',
    logoIniciais: 'R$',
    suportaOpenFinance: false,
  },
  {
    key: 'outro',
    nome: 'Outro banco',
    cor: '#64748B',
    corTexto: '#FFFFFF',
    bgBadge: 'bg-slate-500/15 text-slate-400',
    logoIniciais: 'BCO',
    suportaOpenFinance: false,
  },
];

export const PRESET_COLORS = [
  '#820AD1', // Nubank Purple
  '#EC7000', // Itaú Orange
  '#0038A8', // BB Blue
  '#CC092F', // Bradesco Red
  '#005CA9', // Caixa Blue
  '#FF7A00', // Inter Orange
  '#11C76F', // PicPay Green
  '#009EE3', // Mercado Pago Cyan
  '#001E62', // BTG Navy
  '#10B981', // Emerald
  '#3B82F6', // Modern Blue
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#64748B', // Slate
];

export interface CreateAccountFormData {
  nome: string;
  instituicao: string;
  instituicaoKey: string;
  tipo: AccountType;
  saldoInicialCents: number;
  agencia?: string;
  numeroConta?: string;
  digito?: string;
  observacao?: string;
  cor: string;
  icone?: string;
}

export interface UpdateBalanceData {
  contaId: string;
  novoSaldoCents: number;
  observacao?: string;
}

export interface TransferFundsData {
  contaOrigemId: string;
  contaDestinoId: string;
  valorCents: number;
  data: string;
  descricao?: string;
}

export interface AddTransactionData {
  contaId: string;
  tipo: 'receita' | 'despesa' | 'ajuste_saldo';
  valorCents: number;
  descricao: string;
  categoria?: string;
  data: string;
}

export interface ReconciliationSuggestion {
  id: string;
  manualTransaction: AccountTransaction;
  openFinanceTransaction: AccountTransaction;
  diferencaDias: number;
  percentualMatch: number;
}
