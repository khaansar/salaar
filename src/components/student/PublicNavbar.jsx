'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hexagon, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function PublicNavbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  const links = [
    { name: 'Test Series', href: '/test-series' },
    { name: 'Mock Tests', href: '/tests' },
    { name: 'Categories', href: '/categories' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Hexagon size={20} className="fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                TestHub
              </span>
            </Link>

            <div className="hidden md:flex gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
