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
} from 'lucide-react';

export default function StudentSidebar({
  onNavigate,
}) {
  const pathname = usePathname();

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
      name: 'Previous Attempts',
      href: '/attempts',
      icon: Clock,
    },
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
    <div className="flex h-full flex-col px-4 py-6">
      <Link
        href="/"
        onClick={handleNavigation}
        className="mb-8 flex items-center gap-2 px-2"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Hexagon
            size={20}
            className="fill-current"
          />
        </div>

        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          TestHub
        </span>
      </Link>

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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400'
                }
              />

              {item.name}
            </Link>
          );
        })}

        <div className="pb-2 pt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Analysis & Tools
          </p>
        </div>

        {comingSoonItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.href}
              className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 font-medium text-slate-400 dark:text-slate-600"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                {item.name}
              </div>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                SOON
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}