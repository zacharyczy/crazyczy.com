'use client';

import { Moon, Sun } from 'lucide-react';
import type { Language } from '@/lib/content';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'crazyczy-theme';

export function ThemeToggle({ lang }: { lang: Language }) {

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }

  const label = lang === 'zh' ? '切换亮暗主题' : 'Toggle color theme';

  return (
    <Button type="button" variant="outline" size="icon-lg" className="theme-toggle"
      onClick={toggleTheme} aria-label={label} title={label}>
      <Sun className="theme-icon-light" aria-hidden="true" />
      <Moon className="theme-icon-dark" aria-hidden="true" />
    </Button>
  );
}
