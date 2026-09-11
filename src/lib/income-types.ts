import {
  Receivable,
  ReceivableStatus,
  ReceivableCategory,
  ReceivableOrigin,
  RecurrenceFrequency,
} from './receivable-types';

export type IncomeStatus = 'Recebido' | 'Previsto' | 'Atrasado';

export interface IncomeSummary {
  receitasDoMes: number; // in cents (total expected + received in month)
  recebido: number; // in cents (only received)
  previsto: number; // in cents (pending + overdue)
  quantidade: number;
  media: number; // in cents (receitasDoMes / quantidade)
  percentualRecebido: number; // 0 - 100
}

export interface IncomeFilters {
  month?: number;
  year?: number;
  status?: IncomeStatus | 'Todos';
  categoria?: string;
  origem?: string;
  recorrente?: boolean;
  parcelado?: boolean;
  search?: string;
}

export interface IncomeFormData {
  descricao: string;
  valor: number; // in cents
  categoria: string;
  origem: string;
  data: string; // YYYY-MM-DD
  observacao?: string;
  status: IncomeStatus;
  recorrente?: boolean;
  frequenciaRecorrencia?: RecurrenceFrequency;
  parcelado?: boolean;
  totalParcelas?: number;
}

export type { Receivable as IncomeRecord, ReceivableCategory, ReceivableOrigin, RecurrenceFrequency };
