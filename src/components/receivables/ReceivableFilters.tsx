import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { ReceivableFilters as FiltersType, ReceivableStatus, ReceivableSortBy, SortOrder } from '@/lib/receivable-types';

interface ReceivableFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const CATEGORIES = ['Todas', 'Salário', 'Freelance', 'Vendas', 'Serviços', 'Investimentos', 'Reembolso', 'Outros'];
const ORIGINS = ['Todas', 'Salário', 'Freelance', 'Cliente', 'Venda', 'Empréstimo', 'Outros'];

export function ReceivableFilters({ filters, onChange }: ReceivableFiltersProps) {
  const currentStatus = filters.status || 'Todos';

  const handleStatusChange = (val: string) => {
    onChange({
      ...filters,
      status: val === 'Todos' ? 'Todos' : (val as ReceivableStatus),
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

  const handleOriginChange = (val: string) => {
    onChange({
      ...filters,
      origem: val === 'Todas' ? undefined : val,
    });
  };

  const handleSortChange = (val: string) => {
    let sortBy: ReceivableSortBy = 'vencimento';
    let sortOrder: SortOrder = 'asc';

    switch (val) {
      case 'vencimento-asc':
        sortBy = 'vencimento';
        sortOrder = 'asc';
        break;
      case 'vencimento-desc':
        sortBy = 'vencimento';
        sortOrder = 'desc';
        break;
      case 'valor-desc':
        sortBy = 'valor';
        sortOrder = 'desc';
        break;
      case 'valor-asc':
        sortBy = 'valor';
        sortOrder = 'asc';
        break;
      case 'descricao-asc':
        sortBy = 'descricao';
        sortOrder = 'asc';
        break;
      default:
        break;
    }

    onChange({
      ...filters,
      sortBy,
      sortOrder,
    });
  };

  const sortValue = `${filters.sortBy || 'vencimento'}-${filters.sortOrder || 'asc'}`;

  return (
    <div className="space-y-4 bg-card border border-border/60 p-4 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs Status */}
        <Tabs value={currentStatus} onValueChange={handleStatusChange} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-5 w-full md:w-auto bg-muted/60 p-1">
            <TabsTrigger value="Todos" className="text-xs sm:text-sm">
              Todos
            </TabsTrigger>
            <TabsTrigger value="Pendente" className="text-xs sm:text-sm">
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="Recebido" className="text-xs sm:text-sm">
              Recebidos
            </TabsTrigger>
            <TabsTrigger value="Atrasado" className="text-xs sm:text-sm">
              Atrasados
            </TabsTrigger>
            <TabsTrigger value="Parcial" className="text-xs sm:text-sm">
              Parciais
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Busca Textual */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conta a receber..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-sm bg-background"
          />
        </div>
      </div>

      {/* Filtros Secundários */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Filter className="w-3.5 h-3.5" /> Filtros:
        </div>

        {/* Categoria */}
        <div className="w-[140px]">
          <Select value={filters.categoria || 'Todas'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat === 'Todas' ? 'Todas Categorias' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Origem */}
        <div className="w-[140px]">
          <Select value={filters.origem || 'Todas'} onValueChange={handleOriginChange}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              {ORIGINS.map((ori) => (
                <SelectItem key={ori} value={ori} className="text-xs">
                  {ori === 'Todas' ? 'Todas Origens' : ori}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <Select value={sortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="h-8 text-xs bg-background w-[170px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vencimento-asc" className="text-xs">
                Vencimento (Mais próximo)
              </SelectItem>
              <SelectItem value="vencimento-desc" className="text-xs">
                Vencimento (Mais distante)
              </SelectItem>
              <SelectItem value="valor-desc" className="text-xs">
                Maior Valor
              </SelectItem>
              <SelectItem value="valor-asc" className="text-xs">
                Menor Valor
              </SelectItem>
              <SelectItem value="descricao-asc" className="text-xs">
                Nome (A-Z)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
