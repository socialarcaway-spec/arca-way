import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinanceMonthSelectorProps {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
}

export function FinanceMonthSelector({
  month,
  year,
  onChange,
}: FinanceMonthSelectorProps) {
  const currentDate = new Date(year, month - 1, 1);
  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);

  const prevMonthName = prevDate.toLocaleDateString('pt-BR', { month: 'long' });
  const currentMonthName = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
  });
  const nextMonthName = nextDate.toLocaleDateString('pt-BR', { month: 'long' });

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const handlePrev = () => {
    onChange(prevDate.getMonth() + 1, prevDate.getFullYear());
  };

  const handleNext = () => {
    onChange(nextDate.getMonth() + 1, nextDate.getFullYear());
  };

  const handleCurrent = () => {
    const today = new Date();
    onChange(today.getMonth() + 1, today.getFullYear());
  };

  const isCurrentMonth =
    new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs">
        {/* Previous Month button with label */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline capitalize">{prevMonthName}</span>
        </Button>

        {/* Current Selected Month Display */}
        <div className="px-3 sm:px-4 py-1 text-center font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5 border-x border-border/60 mx-1">
          <span className="capitalize">{currentMonthName}</span>
          <span className="text-muted-foreground font-normal text-xs sm:text-sm">de {year}</span>
        </div>

        {/* Next Month button with label */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <span className="hidden sm:inline capitalize">{nextMonthName}</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {!isCurrentMonth && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCurrent}
          className="h-9 text-xs rounded-xl border-border text-foreground hover:bg-secondary"
        >
          Mês atual
        </Button>
      )}
    </div>
  );
}
