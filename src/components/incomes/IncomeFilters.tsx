import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncomeFilters as FiltersType, IncomeStatus } from '@/lib/income-types';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface IncomeFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const CATEGORIES = [
  'Todas',
  'Salário',
  'Freelance',
  'Vendas',
  'Serviços',
  'Investimentos',
  'Reembolso',
  'Outros',
];

const ORIGINS = [
  'Todas',
  'Salário',
  'Freelance',
  'Cliente',
  'Venda',
  'Investimentos',
  'Reembolso',
  'Outros',
];

const STATUS_OPTIONS: { label: string; value: IncomeStatus | 'Todos' }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Recebidos', value: 'Recebido' },
  { label: 'Previstos', value: 'Previsto' },
  { label: 'Atrasados', value: 'Atrasado' },
];

export function IncomeFilters({ filters, onChange }: IncomeFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleStatusClick = (status: IncomeStatus | 'Todos') => {
    onChange({
      ...filters,
      status,
    });
  };

  const clearFilters = () => {
    onChange({
      month: filters.month,
      year: filters.year,
      status: 'Todos',
      categoria: undefined,
      origem: undefined,
      recorrente: undefined,
      parcelado: undefined,
      search: '',
    });
  };

  const hasActiveFilters =
    (filters.status && filters.status !== 'Todos') ||
    filters.categoria ||
    filters.origem ||
    filters.recorrente !== undefined ||
    filters.parcelado !== undefined ||
    (filters.search && filters.search.trim() !== '');

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Quick status tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border/40">
          {STATUS_OPTIONS.map((opt) => {
            const active = (filters.status || 'Todos') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusClick(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filters */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receita por descrição, cliente, origem..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="pl-9 pr-8 bg-background border-border text-foreground text-xs h-9"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-9 gap-1.5 border-border text-xs ${showAdvanced ? 'bg-secondary text-primary' : 'text-foreground'}`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showAdvanced && (
        <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              Categoria
            </span>
            <Select
              value={filters.categoria || 'Todas'}
              onValueChange={(v) =>
                onChange({ ...filters, categoria: v === 'Todas' ? undefined : v })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              Origem / Fonte
            </span>
            <Select
              value={filters.origem || 'Todas'}
              onValueChange={(v) =>
                onChange({ ...filters, origem: v === 'Todas' ? undefined : v })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {ORIGINS.map((ori) => (
                  <SelectItem key={ori} value={ori} className="text-xs">
                    {ori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              Tipo de Receita
            </span>
            <Select
              value={
                filters.parcelado === true
                  ? 'parcelado'
                  : filters.recorrente === true
                  ? 'recorrente'
                  : 'todos'
              }
              onValueChange={(v) => {
                if (v === 'parcelado') {
                  onChange({ ...filters, parcelado: true, recorrente: undefined });
                } else if (v === 'recorrente') {
                  onChange({ ...filters, recorrente: true, parcelado: undefined });
                } else {
                  onChange({ ...filters, parcelado: undefined, recorrente: undefined });
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="todos" className="text-xs">Todos os tipos</SelectItem>
                <SelectItem value="parcelado" className="text-xs">Somente parceladas</SelectItem>
                <SelectItem value="recorrente" className="text-xs">Somente recorrentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
