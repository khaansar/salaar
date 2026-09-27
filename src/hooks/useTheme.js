'use client';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

function currentTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Reads/writes the persisted theme preference. The initial class on <html>
 * is set synchronously by an inline script in the root layout (before React
 * hydrates) to avoid a flash of the wrong theme; this hook just mirrors and
 * toggles that state afterward.
 */
export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const applyTheme = useCallback((next) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private browsing, etc.) — theme still
      // applies for this session via the DOM class.
    }
    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }, [applyTheme]);

  return { theme, toggleTheme, setTheme: applyTheme };
}