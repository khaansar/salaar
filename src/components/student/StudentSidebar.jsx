'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  FileText,
  Clock,
  Bookmark,
  TrendingUp,
  Calendar,
  Hexagon,
  LayoutDashboard,
} from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';

export default function StudentSidebar({
  onNavigate,
}) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      exact: true,
    },
    {
      name: 'Test Series',
      href: '/test-series',
      icon: Layers,
    },
    {
      name: 'Mock Tests',
      href: '/tests',
      icon: FileText,
    },
    {
      name: 'History',
      href: '/history',
      icon: Clock,
    },
    ...(isAdmin ? [{ name: 'Admin dashboard', href: '/admin-dashboard', icon: LayoutDashboard }] : []),
  ];

  const comingSoonItems = [
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: Bookmark,
    },
    {
      name: 'Performance',
      href: '/performance',
      icon: TrendingUp,
    },
    {
      name: 'Study Plan',
      href: '/study-plan',
      icon: Calendar,
    },
  ];

  const handleNavigation = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col px-3 py-6">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavigation}
              className={`flex items-center gap-3 rounded-lg px-[14px] py-2.5 font-medium transition-colors overflow-hidden ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400'
                }`}
              />

              <span className="max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="pb-2 pt-6">
          <p className="px-[14px] text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Analysis & Tools
          </p>
        </div>

        {comingSoonItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.href}
              className="flex cursor-not-allowed items-center justify-between rounded-lg px-[14px] py-2.5 font-medium text-slate-400 dark:text-slate-600 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="flex-shrink-0" />
                <span className="max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.name}
                </span>
              </div>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                SOON
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
