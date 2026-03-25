'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeKey, applyTokens, getStoredTheme, storeTheme } from '@/lib/design-tokens';

interface ThemeContextValue {
  theme: ThemeKey;
  toggleTheme: () => void;
  setTheme: (t: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('dark');

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTokens(stored);
  }, []);

  const setTheme = (t: ThemeKey) => {
    setThemeState(t);
    applyTokens(t);
    storeTheme(t);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
