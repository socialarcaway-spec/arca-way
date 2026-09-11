import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchExpenses } from "@/lib/api";
import { Expense, ExpenseFilters } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface ExpenseChartProps {
  month: number;
  year: number;
}

export function ExpenseChart({ month, year }: ExpenseChartProps) {
  const filters: ExpenseFilters = { month, year };
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["expenses", month, year],
    queryFn: () => fetchExpenses(filters),
  });

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.categoria || "Outros";
      const val = e.valor / 100; // convert cents to currency
      categoryTotals[cat] = (categoryTotals[cat] || 0) + val;
    });

    return Object.entries(categoryTotals).map(([categoria, total]) => ({
      categoria,
      total,
    }));
  }, [expenses]);

  if (chartData.length === 0) return null;

  return (
    <Card className="border-border bg-card p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Gastos por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="categoria"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `R$ ${v}`}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Total",
                ]}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-foreground)",
                }}
              />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
