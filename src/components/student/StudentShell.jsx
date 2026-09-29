'use client';

import { useEffect, useState } from 'react';
import {
  X,
} from 'lucide-react';

import { useAppSelector } from '../../hooks/useAppSelector';

import PublicNavbar from './PublicNavbar';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

export default function StudentShell({
  children,
}) {
  const {
    user,
    isInitialized,
  } = useAppSelector(
    (state) => state.auth
  );

  const [
    mobileNavOpen,
    setMobileNavOpen,
  ] = useState(false);

  const isAuthenticated =
    isInitialized && !!user;

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () =>
      document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fafafc] dark:bg-slate-950 flex flex-col">
        {/* Skeleton Navbar */}
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-6">
                  <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          </div>
        </nav>

        {/* Skeleton Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl animate-pulse">
            <div className="h-64 w-full rounded-3xl bg-slate-200 dark:bg-slate-800/50 mb-8" />
            <div className="h-10 w-48 rounded-lg bg-slate-200 dark:bg-slate-800/50 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800/50" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Full-width Header */}
        <StudentHeader
          onMenuClick={() =>
            setMobileNavOpen(true)
          }
        />

        <div className="flex flex-1 min-h-0 relative">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block group relative z-50">
            <div className="w-[72px] h-full flex-shrink-0" />
            <div className="absolute top-0 left-0 h-full w-[72px] group-hover:w-64 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden flex-shrink-0 shadow-none group-hover:shadow-2xl">
              <StudentSidebar />
            </div>
          </div>

          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() =>
                  setMobileNavOpen(false)
                }
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              />

              <aside className="relative flex h-full w-[280px] flex-col bg-white shadow-2xl dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() =>
                    setMobileNavOpen(false)
                  }
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>

                <div className="h-full">
                  <StudentSidebar
                    onNavigate={() =>
                      setMobileNavOpen(false)
                    }
                  />
                </div>
              </aside>
            </div>
          )}

          <main className="flex-1 overflow-y-auto bg-[#fafafc] dark:bg-slate-950 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-6">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-slate-950 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
