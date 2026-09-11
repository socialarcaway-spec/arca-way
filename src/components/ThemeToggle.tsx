import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = (localStorage.getItem('arca_theme') as Theme) || 'system';
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('arca_theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={collapsed ? 'icon' : 'sm'}
          className="w-full justify-start gap-2.5 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
          {!collapsed && (
            <span className="text-xs font-medium capitalize">
              {theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Escuro' : 'Claro'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-popover border-border">
        <DropdownMenuItem
          onClick={() => handleSelect('light')}
          className={`flex items-center gap-2 text-xs cursor-pointer ${theme === 'light' ? 'font-semibold text-primary' : 'text-foreground'}`}
        >
          <Sun className="size-3.5 text-amber-500" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect('dark')}
          className={`flex items-center gap-2 text-xs cursor-pointer ${theme === 'dark' ? 'font-semibold text-primary' : 'text-foreground'}`}
        >
          <Moon className="size-3.5 text-sky-400" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect('system')}
          className={`flex items-center gap-2 text-xs cursor-pointer ${theme === 'system' ? 'font-semibold text-primary' : 'text-foreground'}`}
        >
          <Laptop className="size-3.5 text-muted-foreground" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
