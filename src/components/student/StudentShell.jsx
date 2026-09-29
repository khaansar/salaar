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

  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex-shrink-0">
          <StudentSidebar />
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

        <div className="flex min-w-0 flex-1 flex-col">
          <StudentHeader
            onMenuClick={() =>
              setMobileNavOpen(true)
            }
          />

          <main className="flex-1 overflow-y-auto bg-[#fafafc] dark:bg-slate-950 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
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

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}