import { PayableSummary } from '@/lib/payable-types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface PayableSummaryCardsProps {
  summary?: PayableSummary;
  isLoading: boolean;
}

export function PayableSummaryCards({ summary, isLoading }: PayableSummaryCardsProps) {
  const formatBRL = (cents: number = 0) => {
    const val = cents / 100;
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border border-border bg-card p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-3 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const data = summary || {
    totalMes: 0,
    totalPago: 0,
    totalPendente: 0,
    totalAtrasado: 0,
    countTotal: 0,
    countPago: 0,
    countPendente: 0,
    countAtrasado: 0,
    percentualPago: 0,
  };

  const cards = [
    {
      title: 'TOTAL DO MÊS',
      value: formatBRL(data.totalMes),
      subtext: `${data.countTotal} ${data.countTotal === 1 ? 'conta' : 'contas'} previstas`,
      icon: CalendarDays,
      badgeColor: 'text-primary bg-primary/10',
      borderColor: 'hover:border-primary/40',
    },
    {
      title: 'PAGO',
      value: formatBRL(data.totalPago),
      subtext: `${data.countPago} quitada(s) · ${data.percentualPago}%`,
      icon: CheckCircle2,
      badgeColor: 'text-emerald-500 bg-emerald-500/10 dark:text-emerald-400',
      borderColor: 'hover:border-emerald-500/40',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'PENDENTE',
      value: formatBRL(data.totalPendente),
      subtext: `${data.countPendente} a vencer no mês`,
      icon: Clock,
      badgeColor: 'text-amber-500 bg-amber-500/10 dark:text-amber-400',
      borderColor: 'hover:border-amber-500/40',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'ATRASADO',
      value: formatBRL(data.totalAtrasado),
      subtext: `${data.countAtrasado} conta(s) vencida(s)`,
      icon: AlertTriangle,
      badgeColor: 'text-rose-500 bg-rose-500/10 dark:text-rose-400',
      borderColor: 'hover:border-rose-500/40',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      title: 'QUANTIDADE DE CONTAS',
      value: `${data.countTotal} contas`,
      subtext: `${data.countPago} pagas · ${data.countPendente + data.countAtrasado} em aberto`,
      icon: Receipt,
      badgeColor: 'text-blue-500 bg-blue-500/10 dark:text-blue-400',
      borderColor: 'hover:border-blue-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`transition-all duration-200 border border-border bg-card shadow-xs ${card.borderColor}`}
          >
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {card.title}
                </span>
                <span className={`p-1.5 rounded-lg ${card.badgeColor}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className={`text-xl font-bold tracking-tight ${card.valueColor || 'text-foreground'}`}>
                  {card.value}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {card.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
