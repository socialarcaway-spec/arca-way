import { IncomeSummary } from '@/lib/income-types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  CheckCircle2,
  CalendarClock,
  Layers,
  Calculator,
} from 'lucide-react';

interface IncomeSummaryCardsProps {
  summary?: IncomeSummary;
  isLoading: boolean;
}

export function IncomeSummaryCards({ summary, isLoading }: IncomeSummaryCardsProps) {
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
    receitasDoMes: 0,
    recebido: 0,
    previsto: 0,
    quantidade: 0,
    media: 0,
    percentualRecebido: 0,
  };

  const cards = [
    {
      title: 'RECEITAS DO MÊS',
      value: formatBRL(data.receitasDoMes),
      subtext: `${data.quantidade} entrada(s) programada(s)`,
      icon: TrendingUp,
      badgeColor: 'text-primary bg-primary/10',
      borderColor: 'hover:border-primary/40',
    },
    {
      title: 'RECEBIDO',
      value: formatBRL(data.recebido),
      subtext: `${data.percentualRecebido}% realizado do total`,
      icon: CheckCircle2,
      badgeColor: 'text-emerald-500 bg-emerald-500/10 dark:text-emerald-400',
      borderColor: 'hover:border-emerald-500/40',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'PREVISTO',
      value: formatBRL(data.previsto),
      subtext: 'Aguardando compensação',
      icon: CalendarClock,
      badgeColor: 'text-blue-500 bg-blue-500/10 dark:text-blue-400',
      borderColor: 'hover:border-blue-500/40',
      valueColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'QUANTIDADE',
      value: `${data.quantidade} receitas`,
      subtext: 'Entradas no mês',
      icon: Layers,
      badgeColor: 'text-purple-500 bg-purple-500/10 dark:text-purple-400',
      borderColor: 'hover:border-purple-500/40',
    },
    {
      title: 'MÉDIA',
      value: formatBRL(data.media),
      subtext: 'Ticket médio por entrada',
      icon: Calculator,
      badgeColor: 'text-amber-500 bg-amber-500/10 dark:text-amber-400',
      borderColor: 'hover:border-amber-500/40',
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
