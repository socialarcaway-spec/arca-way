import { Expense, ExpenseFilters } from "./types";
import {
  fetchPayables,
  createPayable,
  updatePayable,
  deletePayable,
  markAsPaid,
} from "./payable-api";
import { Payable } from "./payable-types";

export type { Expense };

function mapPayableToExpense(p: Payable): Expense {
  // Generate stable numeric ID from string ID
  const numericId = Math.abs(
    p.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ) % 1000000000;

  return {
    id: numericId,
    userId: p.userId,
    descricao: p.descricao,
    valor: p.valor,
    categoria: p.categoria,
    dataVencimento: p.dataVencimento,
    dataPagamento: p.dataPagamento,
    status: p.status,
    recorrente: p.recorrente,
    parcelaNumero: p.parcelaNumero,
    totalParcelas: p.totalParcelas,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function fetchExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  const payables = await fetchPayables({
    month: filters.month,
    year: filters.year,
    categoria: filters.categoria,
    status: filters.status,
    search: filters.search,
  });

  return payables.map(mapPayableToExpense);
}

export async function createExpense(
  expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
): Promise<Expense> {
  const created = await createPayable({
    descricao: expense.descricao,
    valor: expense.valor,
    categoria: expense.categoria,
    dataVencimento: expense.dataVencimento,
    formaPagamento: 'Pix',
    status: expense.status || 'Pendente',
    recorrente: expense.recorrente,
    parcelado: Boolean(expense.totalParcelas && expense.totalParcelas > 1),
    totalParcelas: expense.totalParcelas,
  });

  return mapPayableToExpense(created[0]);
}

export async function updateExpense(
  id: number,
  patch: Partial<Omit<Expense, "id">>,
): Promise<Expense> {
  // Find matching payable by mapped id or update by first matching
  const all = await fetchPayables();
  const target = all.find((p) => mapPayableToExpense(p).id === id);

  if (!target) {
    throw new Error(`Expense with id ${id} not found`);
  }

  if (patch.status === 'Pago') {
    const updated = await markAsPaid(target.id, patch.dataPagamento ?? undefined);
    return mapPayableToExpense(updated);
  }

  const updated = await updatePayable(target.id, {
    descricao: patch.descricao,
    valor: patch.valor,
    categoria: patch.categoria,
    dataVencimento: patch.dataVencimento,
  });

  return mapPayableToExpense(updated);
}

export async function deleteExpense(id: number): Promise<void> {
  const all = await fetchPayables();
  const target = all.find((p) => mapPayableToExpense(p).id === id);
  if (target) {
    await deletePayable(target.id);
  }
}
