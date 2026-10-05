'use client';

import { Bell, Moon, Sun, LogOut, Menu, Search, UserRound, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../store/slices/authSlice';

import { useState, useRef, useEffect } from 'react';

const links = [
  { name: 'Home', href: '/' },
  { name: 'Mock Tests', href: '/tests' },
  { name: 'Test Series', href: '/test-series' },
  { name: 'Previous Year Papers', href: '/previous-year-papers' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Pricing', href: '/pricing' },
];

export default function StudentHeader({ onMenuClick }) {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initial = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setDropdownOpen(false);
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Student';

  const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200';

  return (
    <header className="relative z-50 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-16 items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden="true">
              <polygon points="0,20 8,2 16,14 24,2 32,20 26,20 24,13 16,20 8,13 6,20" fill="#5e43f3" />
            </svg>
            <span className="text-lg font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">Baahubali</span>
          </Link>
        </div>

        <nav className="hidden h-16 items-center gap-5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex h-16 items-center border-b-2 text-[13px] font-semibold transition-colors ${
                isActive(link.href)
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* TODO: wire to real search (currently submits ?q= to /tests) */}
          <form action="/tests" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 xl:flex">
            <Search size={15} className="text-slate-400" />
            <input name="q" placeholder="Search exams, tests, topics..." className="w-44 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          </form>

          <button type="button" onClick={toggleTheme} className={iconBtn} aria-label="Toggle theme">
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button type="button" className={iconBtn} aria-label="Notifications">
            <Bell size={19} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full focus:outline-none"
              aria-label="Open profile menu"
              aria-expanded={dropdownOpen}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-600 ring-1 ring-brand-100 transition-all hover:ring-2 hover:ring-brand-600/30">
                {initial}
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fullName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <UserRound size={16} />
                    </span>
                    <span>My Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
                      <LogOut size={16} />
                    </span>
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </header>
  );
}