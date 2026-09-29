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
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
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

          <main className="flex-1 overflow-y-auto bg-[#fafafc] p-4 dark:bg-slate-900 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafc] dark:bg-slate-900">
      {/* Until the session check finishes, show a neutral bar so signed-in
          users don't see a flash of "Log in / Sign up" buttons. */}
      <PublicNavbar minimal={!isInitialized} />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}