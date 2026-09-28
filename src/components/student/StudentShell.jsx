'use client';

import { useAppSelector } from '../../hooks/useAppSelector';
import PublicNavbar from './PublicNavbar';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

export default function StudentShell({ children }) {
  const { user, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  const isAuthenticated = isInitialized && !!user;

  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
          <StudentSidebar />
        </div>

        <div className="flex-1 flex flex-col w-full min-w-0">
          <StudentHeader />

          <main className="flex-1 overflow-y-auto bg-[#fafafc] dark:bg-slate-900 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Bar (or Drawer) could go here */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-slate-900 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}