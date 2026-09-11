import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const [open, setOpen] = useState(false);

  const handlePrev = () => {
    const date = new Date(year, month - 1 - 1); // month is 1-indexed
    onChange(date.getMonth() + 1, date.getFullYear());
  };

  const handleNext = () => {
    const date = new Date(year, month - 1 + 1);
    onChange(date.getMonth() + 1, date.getFullYear());
  };

  const selectedDate = new Date(year, month - 1);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrev}>
        ‹
      </Button>
      <div className="relative">
        <Button variant="outline" onClick={() => setOpen(!open)}>
          {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </Button>
        {open && (
          <div className="absolute left-0 top-10 z-10">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onChange(date.getMonth() + 1, date.getFullYear());
                  setOpen(false);
                }
              }}
            />
          </div>
        )}
      </div>
      <Button variant="outline" size="icon" onClick={handleNext}>
        ›
      </Button>
    </div>
  );
}
