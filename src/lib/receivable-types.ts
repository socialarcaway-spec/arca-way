export type ReceivableStatus = 'Pendente' | 'Recebido' | 'Atrasado' | 'Parcial';

export type ReceivableOrigin = 'Salário' | 'Freelance' | 'Cliente' | 'Venda' | 'Empréstimo' | 'Outros';

export type ReceivableCategory = 'Salário' | 'Freelance' | 'Vendas' | 'Serviços' | 'Investimentos' | 'Reembolso' | 'Outros';

export type RecurrenceFrequency = 'Semanal' | 'Quinzenal' | 'Mensal' | 'Anual';

export interface Receivable {
  id: string;
  userId: number;
  descricao: string;
  valor: number; // Stored in cents (ex: R$ 100,00 = 10000)
  valorRecebido?: number | null; // Stored in cents, used for partial receipt
  categoria: ReceivableCategory | string;
  dataPrevisao: string; // ISO date string YYYY-MM-DD
  dataRecebimento?: string | null; // ISO date string or null
  status: ReceivableStatus;
  origem: ReceivableOrigin | string;
  observacao?: string;
  recorrente?: boolean;
  frequenciaRecorrencia?: RecurrenceFrequency;
  parcelado?: boolean;
  parcelaNumero?: number;
  totalParcelas?: number;
  grupoParcelamentoId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReceivableSortBy = 'vencimento' | 'descricao' | 'valor' | 'origem' | 'categoria' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface ReceivableFilters {
  month?: number; // 1-12
  year?: number;
  status?: ReceivableStatus | 'Todos';
  categoria?: string;
  origem?: string;
  search?: string;
  sortBy?: ReceivableSortBy;
  sortOrder?: SortOrder;
}

export interface ReceivableFormData {
  descricao: string;
  valor: number; // in cents
  valorRecebido?: number;
  categoria: string;
  dataPrevisao: string;
  dataRecebimento?: string | null;
  status: ReceivableStatus;
  origem: string;
  observacao?: string;
  recorrente?: boolean;
  frequenciaRecorrencia?: RecurrenceFrequency;
  parcelado?: boolean;
  totalParcelas?: number;
}

export interface ReceivableSummary {
  totalPrevisto: number; // in cents
  totalRecebido: number; // in cents
  totalPendente: number; // in cents
  totalAtrasado: number; // in cents
  countTotal: number;
  countRecebido: number;
  countPendente: number;
  countAtrasado: number;
  countParcial: number;
  percentualRecebido: number; // 0 - 100
}
