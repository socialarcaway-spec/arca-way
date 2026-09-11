import { useMemo } from 'react';
import { Payable } from '@/lib/payable-types';
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

interface PayableChartProps {
  payables: Payable[];
}

const COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#64748b', // slate
];

export function PayableChart({ payables }: PayableChartProps) {
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    payables.forEach((p) => {
      map[p.categoria] = (map[p.categoria] || 0) + p.valor;
    });

    return Object.entries(map)
      .map(([name, totalCents]) => ({
        name,
        valor: totalCents / 100,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [payables]);

  const statusData = useMemo(() => {
    let pago = 0;
    let pendente = 0;
    let atrasado = 0;

    payables.forEach((p) => {
      if (p.status === 'Pago') pago += p.valor;
      else if (p.status === 'Atrasado') atrasado += p.valor;
      else pendente += p.valor;
    });

    return [
      { name: 'Pago', valor: pago / 100, fill: '#10b981' },
      { name: 'Pendente', valor: pendente / 100, fill: '#f59e0b' },
      { name: 'Atrasado', valor: atrasado / 100, fill: '#f43f5e' },
    ].filter((d) => d.valor > 0);
  }, [payables]);

  if (payables.length === 0) return null;

  const formatTooltip = (value: any) => [
    `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    'Total',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category Breakdown */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Contas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
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
                  width={85}
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
                <Bar dataKey="valor" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Proportion */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Status dos Compromissos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between">
          <div className="h-[220px] w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="valor"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
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

          <div className="w-full sm:w-1/2 flex flex-col gap-2.5 pt-2 sm:pt-0 sm:pl-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground font-medium">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name}
                </span>
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
