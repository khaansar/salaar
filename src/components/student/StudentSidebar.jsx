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
  Hexagon
} from 'lucide-react';

export default function StudentSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home, exact: true },
    { name: 'Test Series', href: '/test-series', icon: Layers },
    { name: 'Mock Tests', href: '/tests', icon: FileText },
    { name: 'Previous Attempts', href: '/attempts', icon: Clock },
  ];

  const comingSoonItems = [
    { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    { name: 'Performance', href: '/performance', icon: TrendingUp },
    { name: 'Study Plan', href: '/study-plan', icon: Calendar },
  ];

  return (
    <div className="h-full flex flex-col py-6 px-4">
      <Link href="/" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <Hexagon size={20} className="fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          TestHub
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Analysis & Tools
          </p>
        </div>

        {comingSoonItems.map((item) => (
          <div
            key={item.href}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              {item.name}
            </div>
            <span className="text-[10px] py-0.5 px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
              SOON
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
