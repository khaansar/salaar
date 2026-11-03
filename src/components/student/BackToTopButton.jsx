'use client';

import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const handleBackToTop = () => {
    // Student pages scroll within the StudentShell main container.
    const scrollContainer = document.querySelector(
      'main.overflow-y-auto'
    );

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    // Public pages use normal document scrolling.
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      aria-label="Back to top"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white dark:border-white/10 dark:text-zinc-300 dark:hover:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      <ArrowUp size={15} aria-hidden="true" />
    </button>
  );
}
