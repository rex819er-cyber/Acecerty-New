import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', isDark: true, toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
    root.style.setProperty('--ace-bg', '#050505');
    root.style.setProperty('--ace-card', '#0E0E0E');
    root.style.setProperty('--ace-border', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--ace-text', '#FFFFFF');
    root.style.setProperty('--ace-muted', 'rgba(255,255,255,0.45)');
    root.style.setProperty('--ace-surface', '#141414');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--ace-bg', '#FAF9F6');
    root.style.setProperty('--ace-card', '#FFFFFF');
    root.style.setProperty('--ace-border', 'rgba(0,0,0,0.08)');
    root.style.setProperty('--ace-text', '#111111');
    root.style.setProperty('--ace-muted', 'rgba(0,0,0,0.45)');
    root.style.setProperty('--ace-surface', '#F0EFE9');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    applyTheme('dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setTheme(next);
        applyTheme(next);
      });
    } else {
      setTheme(next);
      applyTheme(next);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
