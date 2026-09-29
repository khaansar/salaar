'use client';

import {
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  Hexagon,
} from 'lucide-react';
import Link from 'next/link';

import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../store/slices/authSlice';

import {
  useState,
  useRef,
  useEffect,
} from 'react';

export default function StudentHeader({
  onMenuClick,
}) {
  const { isDark, toggleTheme } = useTheme();

  const { user } = useAppSelector(
    (state) => state.auth
  );

  const dispatch = useAppDispatch();

  const [
    dropdownOpen,
    setDropdownOpen,
  ] = useState(false);

  const dropdownRef = useRef(null);

  const initial = (
    user?.firstName?.[0] ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setDropdownOpen(false);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-8">
      {/* Left side: Logo */}
      <div className="flex-1 flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Hexagon
              size={20}
              className="fill-current"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            TestHub
          </span>
        </Link>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <div
          className="relative"
          ref={dropdownRef}
        >
          <button
            type="button"
            onClick={() =>
              setDropdownOpen(
                (value) => !value
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 font-semibold text-indigo-600 transition-all hover:ring-2 hover:ring-indigo-500/20 focus:outline-none dark:border-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400"
            aria-label="Open profile menu"
            aria-expanded={dropdownOpen}
          >
            {initial}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ''}`
                    : 'Student'}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}