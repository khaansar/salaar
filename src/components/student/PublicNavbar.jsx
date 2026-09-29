'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Hexagon,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useTheme } from '../../hooks/useTheme';

export default function PublicNavbar({ minimal = false }) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const links = [
    {
      name: 'Test Series',
      href: '/test-series',
    },
    {
      name: 'Mock Tests',
      href: '/tests',
    },
    {
      name: 'Categories',
      href: '/categories',
    },
  ];

  const isActive = (href) =>
    pathname === href ||
    pathname.startsWith(`${href}/`);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
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

          {!minimal && (
          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {!minimal && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Sign up free
              </Link>
            </div>
            )}

            {!minimal && (
            <button
              type="button"
              onClick={() =>
                setMobileOpen((value) => !value)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
              aria-label={
                mobileOpen
                  ? 'Close navigation'
                  : 'Open navigation'
              }
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
            )}
          </div>
        </div>

        {!minimal && mobileOpen && (
          <div className="border-t border-slate-200 py-4 dark:border-slate-800 md:hidden">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive(link.href)
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
