export type PayableStatus = 'Pendente' | 'Pago' | 'Atrasado';

export type PayablePaymentMethod =
  | 'Boleto'
  | 'Pix'
  | 'Cartão de Crédito'
  | 'Cartão de Débito'
  | 'Débito Automático'
  | 'Dinheiro'
  | 'Transferência'
  | 'Outros';

export type PayableCategory =
  | 'Moradia'
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Lazer'
  | 'Assinaturas'
  | 'Serviços'
  | 'Impostos'
  | 'Outros';

export type RecurrenceFrequency = 'Semanal' | 'Quinzenal' | 'Mensal' | 'Anual';

export interface Payable {
  id: string;
  userId: number;
  descricao: string;
  valor: number; // Stored in cents (ex: R$ 100,00 = 10000)
  valorPago?: number | null; // Stored in cents
  categoria: PayableCategory | string;
  dataVencimento: string; // ISO date string YYYY-MM-DD
  dataPagamento?: string | null; // ISO date string or null
  formaPagamento: PayablePaymentMethod | string;
  status: PayableStatus;
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

export type PayableSortBy = 'vencimento' | 'descricao' | 'valor' | 'categoria' | 'status' | 'formaPagamento';
export type SortOrder = 'asc' | 'desc';

export interface PayableFilters {
  month?: number; // 1-12
  year?: number;
  status?: PayableStatus | 'Todos';
  categoria?: string;
  formaPagamento?: string;
  recorrente?: boolean;
  parcelado?: boolean;
  search?: string;
  sortBy?: PayableSortBy;
  sortOrder?: SortOrder;
}

export interface PayableFormData {
  descricao: string;
  valor: number; // in cents
  valorPago?: number;
  categoria: string;
  dataVencimento: string;
  dataPagamento?: string | null;
  formaPagamento: string;
  status: PayableStatus;
  observacao?: string;
  recorrente?: boolean;
  frequenciaRecorrencia?: RecurrenceFrequency;
  parcelado?: boolean;
  totalParcelas?: number;
}

export interface PayableSummary {
  totalMes: number; // in cents (All accounts due this month)
  totalPago: number; // in cents (Only accounts marked as Pago)
  totalPendente: number; // in cents (Accounts due this month that are Pendente)
  totalAtrasado: number; // in cents (Accounts that are past due date and not Pago)
  countTotal: number;
  countPago: number;
  countPendente: number;
  countAtrasado: number;
  percentualPago: number; // 0 - 100
}
