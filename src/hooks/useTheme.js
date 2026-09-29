'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

function currentTheme() {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const applyTheme = useCallback((next) => {
    document.documentElement.classList.toggle(
      'dark',
      next === 'dark'
    );

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}

    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(
      currentTheme() === 'dark'
        ? 'light'
        : 'dark'
    );
  }, [applyTheme]);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: applyTheme,
  };
}