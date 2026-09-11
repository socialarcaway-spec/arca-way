import { Expense, ExpenseFilters } from './types';

export type { Expense };

// Helper to retrieve the bearer token (assumes it is stored in localStorage under 'auth_token')
function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_BASE = (import.meta.env['VITE_API_BASE'] as string | undefined) ?? '/api';

export async function fetchExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filters.month) params.append('month', String(filters.month));
  if (filters.year) params.append('year', String(filters.year));
  if (filters.categoria) params.append('categoria', filters.categoria);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const response = await fetch(`${API_BASE}/expenses?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  const data = (await response.json()) as Expense[];
  return data;
}

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  const response = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    throw new Error('Failed to create expense');
  }
  return (await response.json()) as Expense;
}

export async function updateExpense(id: number, expense: Partial<Omit<Expense, 'id'>>): Promise<Expense> {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    throw new Error('Failed to update expense');
  }
  return (await response.json()) as Expense;
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete expense');
  }
}
