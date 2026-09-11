import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Receivable } from '@/lib/receivable-types';
import { BarChart3, PieChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReceivableChartProps {
  allReceivables: Receivable[];
  currentMonth: number;
  currentYear: number;
  isLoading?: boolean;
}

const ORIGIN_COLORS: Record<string, string> = {
  Salário: '#10b981', // emerald-500
  Freelance: '#6366f1', // indigo-500
  Cliente: '#3b82f6', // blue-500
  Venda: '#8b5cf6', // violet-500
  Empréstimo: '#f59e0b', // amber-500
  Outros: '#64748b', // slate-500
};

export function ReceivableChart({
  allReceivables,
  currentMonth,
  currentYear,
  isLoading,
}: ReceivableChartProps) {
  // Monthly Comparison Data (Last 6 Months)
  const monthlyData = useMemo(() => {
    const months: { month: number; year: number; label: string }[] = [];

    // 6 months ending at current selection
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      months.push({ month: m, year: y, label: `${label}/${String(y).substring(2)}` });
    }

    return months.map(({ month, year, label }) => {
      const filtered = allReceivables.filter((item) => {
        const parts = item.dataPrevisao.split('-');
        if (parts.length < 2) return false;
        return parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === month;
      });

      let previsto = 0;
      let recebido = 0;

      for (const item of filtered) {
        previsto += item.valor / 100;
        if (item.status === 'Recebido') {
          recebido += item.valor / 100;
        } else if (item.status === 'Parcial' && item.valorRecebido) {
          recebido += item.valorRecebido / 100;
        }
      }

      return {
        label,
        Previsto: Math.round(previsto),
        Recebido: Math.round(recebido),
      };
    });
  }, [allReceivables, currentMonth, currentYear]);

  // Distribution by Origin for current month
  const originData = useMemo(() => {
    const currentMonthItems = allReceivables.filter((item) => {
      const parts = item.dataPrevisao.split('-');
      if (parts.length < 2) return false;
      return (
        parseInt(parts[0], 10) === currentYear &&
        parseInt(parts[1], 10) === currentMonth
      );
    });

    const map: Record<string, number> = {};

    for (const item of currentMonthItems) {
      const ori = item.origem || 'Outros';
      map[ori] = (map[ori] || 0) + item.valor / 100;
    }

    return Object.entries(map).map(([origem, valor]) => ({
      origem,
      valor: Math.round(valor),
      color: ORIGIN_COLORS[origem] || '#64748b',
    }));
  }, [allReceivables, currentMonth, currentYear]);

  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border/60">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Previsto vs Recebido Chart */}
      <Card className="bg-card border border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Previsto vs. Recebido (6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  formatter={(value: number) => [formatBRL(value)]}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Previsto" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Recebido" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribution by Origin */}
      <Card className="bg-card border border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Distribuição por Origem (Mês Atual)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {originData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
              Sem dados para este mês
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={originData}
                  margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" stroke="#888888" fontSize={11} tickFormatter={(val) => `R$${val}`} />
                  <YAxis type="category" dataKey="origem" stroke="#888888" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    formatter={(value: number) => [formatBRL(value), 'Valor']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="valor" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {originData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
