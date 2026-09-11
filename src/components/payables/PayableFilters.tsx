import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PayableFilters as FiltersType,
  PayableQuickFilter,
  PayableSortBy,
  PAYABLE_CATEGORIES,
} from '@/lib/payable-types';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface PayableFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const QUICK_TABS: PayableQuickFilter[] = [
  'Todas',
  'Pendentes',
  'Pagas',
  'Vencidas',
  'Recorrentes',
  'Parceladas',
];

const SORT_OPTIONS: { label: string; value: PayableSortBy }[] = [
  { label: 'Vencimento mais próximo', value: 'vencimento' },
  { label: 'Vencimento mais distante', value: 'vencimento_desc' },
  { label: 'Maior valor', value: 'valor_desc' },
  { label: 'Menor valor', value: 'valor_asc' },
  { label: 'Mais recentes', value: 'recentes' },
  { label: 'Mais antigas', value: 'antigas' },
  { label: 'Vencidas primeiro', value: 'vencidas_primeiro' },
  { label: 'Nome (A-Z)', value: 'descricao' },
];

export function PayableFilters({ filters, onChange }: PayableFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentQuick = filters.quickFilter || 'Todas';

  const handleQuickTabClick = (tab: PayableQuickFilter) => {
    onChange({
      ...filters,
      quickFilter: tab,
      status: 'Todos',
      recorrente: undefined,
      parcelado: undefined,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleCategoryChange = (val: string) => {
    onChange({
      ...filters,
      categoria: val === 'Todas' ? undefined : val,
    });
  };

  const handlePaymentMethodChange = (val: string) => {
    onChange({
      ...filters,
      formaPagamento: val === 'Todas' ? undefined : val,
    });
  };

  const handleSortChange = (val: PayableSortBy) => {
    onChange({
      ...filters,
      sortBy: val,
    });
  };

  const clearFilters = () => {
    onChange({
      month: filters.month,
      year: filters.year,
      quickFilter: 'Todas',
      status: 'Todos',
      categoria: undefined,
      formaPagamento: undefined,
      recorrente: undefined,
      parcelado: undefined,
      search: '',
      sortBy: 'vencimento',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    (filters.quickFilter && filters.quickFilter !== 'Todas') ||
    filters.categoria ||
    filters.formaPagamento ||
    (filters.search && filters.search.trim() !== '');

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Quick Tabs: Todas, Pendentes, Pagas, Vencidas, Recorrentes, Parceladas */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/40 overflow-x-auto">
          {QUICK_TABS.map((tab) => {
            const active = currentQuick === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleQuickTabClick(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  active
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-1 lg:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar conta por nome, categoria ou observação..."
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
            className={`h-9 gap-1.5 border-border text-xs ${
              showAdvanced ? 'bg-secondary text-primary' : 'text-foreground'
            }`}
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
              title="Limpar filtros"
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
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-52">
                <SelectItem value="Todas" className="text-xs">
                  Todas as Categorias
                </SelectItem>
                {PAYABLE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              Forma de Pagamento
            </span>
            <Select
              value={filters.formaPagamento || 'Todas'}
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground">
                <SelectValue placeholder="Todas as formas" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Todas" className="text-xs">
                  Todas as Formas
                </SelectItem>
                <SelectItem value="Boleto" className="text-xs">Boleto</SelectItem>
                <SelectItem value="Pix" className="text-xs">Pix</SelectItem>
                <SelectItem value="Cartão de Crédito" className="text-xs">Cartão de Crédito</SelectItem>
                <SelectItem value="Cartão de Débito" className="text-xs">Cartão de Débito</SelectItem>
                <SelectItem value="Débito Automático" className="text-xs">Débito Automático</SelectItem>
                <SelectItem value="Transferência" className="text-xs">Transferência</SelectItem>
                <SelectItem value="Dinheiro" className="text-xs">Dinheiro</SelectItem>
                <SelectItem value="Outros" className="text-xs">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1 flex items-center gap-1">
              <ArrowUpDown className="size-3" /> Ordenar por
            </span>
            <Select
              value={filters.sortBy || 'vencimento'}
              onValueChange={(val) => handleSortChange(val as PayableSortBy)}
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
