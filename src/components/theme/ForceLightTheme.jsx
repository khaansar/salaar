'use client';

import { useEffect } from 'react';

export default function ForceLightTheme() {
  useEffect(() => {
    // Check if the html tag currently has the dark class
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');

    // Force remove it
    if (hadDark) {
      html.classList.remove('dark');
    }

    // Restore on unmount
    return () => {
      if (hadDark) {
        html.classList.add('dark');
      }
    };
  }, []);

  return null;
}
