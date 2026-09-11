import { useMemo } from 'react';
import { IncomeRecord } from '@/lib/income-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface IncomeChartsProps {
  incomes: IncomeRecord[];
}

const COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

export function IncomeCharts({ incomes }: IncomeChartsProps) {
  // Category Breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    incomes.forEach((i) => {
      map[i.categoria] = (map[i.categoria] || 0) + i.valor;
    });

    return Object.entries(map)
      .map(([name, totalCents]) => ({
        name,
        valor: totalCents / 100,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [incomes]);

  // Origin Breakdown
  const originData = useMemo(() => {
    const map: Record<string, number> = {};
    incomes.forEach((i) => {
      map[i.origem] = (map[i.origem] || 0) + i.valor;
    });

    return Object.entries(map)
      .map(([name, totalCents]) => ({
        name,
        valor: totalCents / 100,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [incomes]);

  // Previsto vs Recebido
  const comparisonData = useMemo(() => {
    let recebido = 0;
    let previsto = 0;

    incomes.forEach((i) => {
      if (i.status === 'Recebido') {
        recebido += i.valor;
      } else if (i.status === 'Parcial') {
        const rec = i.valorRecebido || 0;
        recebido += rec;
        previsto += i.valor - rec;
      } else {
        previsto += i.valor;
      }
    });

    return [
      { name: 'Recebido', valor: recebido / 100, fill: '#10b981' },
      { name: 'Previsto', valor: previsto / 100, fill: '#3b82f6' },
    ].filter((d) => d.valor > 0);
  }, [incomes]);

  if (incomes.length === 0) return null;

  const formatTooltip = (value: any) => [
    `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    'Valor',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Category Pie */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Receitas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="valor"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={formatTooltip}
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-foreground)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full grid grid-cols-2 gap-1.5 pt-2">
            {categoryData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] truncate">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Origin Bar Chart */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Receitas por Origem / Fonte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originData.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                  tickFormatter={(v) => `R$${v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'var(--color-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={75}
                />
                <Tooltip
                  formatter={formatTooltip}
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-foreground)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="valor" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Previsto x Recebido */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Previsto vs Recebido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barSize={36} margin={{ top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                  tickFormatter={(v) => `R$${v}`}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={formatTooltip}
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-foreground)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-around text-xs">
            {comparisonData.map((item) => (
              <div key={item.name} className="text-center">
                <span className="text-muted-foreground block text-[11px]">{item.name}</span>
                <span className="font-bold text-foreground">
                  R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
