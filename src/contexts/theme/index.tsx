'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import type { Theme, ThemeContextType } from './types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(newTheme: Theme): void {
  if (typeof window === 'undefined') return;
  const html = document.documentElement;
  console.log('[Theme] Applying theme:', newTheme);
  console.log('[Theme] Before - html classes:', html.className);
  console.log('[Theme] Before - html has dark:', html.classList.contains('dark'));

  if (newTheme === 'dark') {
    html.classList.add('dark');
    html.setAttribute('data-theme', 'dark');
    console.log('[Theme] Added dark class, current classes:', html.className);
    console.log('[Theme] After - html has dark:', html.classList.contains('dark'));
  } else {
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
    console.log('[Theme] Removed dark class, current classes:', html.className);
    console.log('[Theme] After - html has dark:', html.classList.contains('dark'));
  }

  const computedStyle = window.getComputedStyle(html);
  console.log('[Theme] Computed color-scheme:', computedStyle.colorScheme);
  console.log('[Theme] Computed background-color:', computedStyle.backgroundColor);
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const initialTheme = getInitialTheme();
    console.log('[Theme] Initial theme:', initialTheme);
    applyTheme(initialTheme);
    return initialTheme;
  });
  const mounted = typeof window !== 'undefined';

  const toggleTheme = useCallback(() => {
    console.log('[Theme] Toggle clicked, current theme:', theme);
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('[Theme] Toggling from', prevTheme, 'to', newTheme);
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      console.log('[Theme] Saved to localStorage:', newTheme);
      return newTheme;
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
