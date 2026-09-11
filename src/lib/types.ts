export type ExpenseStatus = "Pendente" | "Pago" | "Atrasado";

export interface Expense {
  id: number;
  userId: number;
  descricao: string;
  valor: number; // stored as cents? using number for simplicity
  categoria: string;
  dataVencimento: string; // ISO date string
  dataPagamento?: string | null; // ISO date string or null
  status: ExpenseStatus;
  recorrente?: boolean; // true if parcelado
  frequencia?: number; // number of months between parcels
  parcelaNumero?: number; // which parcela this record is (1‑based)
  totalParcelas?: number; // total number of parcels
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  month?: number; // 1‑12
  year?: number;
  categoria?: string;
  status?: ExpenseStatus;
  search?: string;
}
