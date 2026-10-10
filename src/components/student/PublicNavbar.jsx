'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, X, Search, UserRound, LogOut, ChevronDown, ReceiptText, Settings, CircleHelp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../store/slices/authSlice';

const links = [
  { name: 'Home', href: '/' },
  { name: 'Explore Tests', href: '/tests' },
  { name: 'My Learning', href: '/history' },
];

import BrandLogo from '../common/BrandLogo';

export default function PublicNavbar({ minimal = false }) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initial = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Student';

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

  const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <BrandLogo onClick={() => setMobileOpen(false)} />


          {!minimal && (
            <div className="hidden h-16 items-center gap-5 lg:flex">
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
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {!minimal && (
              // TODO: wire to real search (currently submits ?q= to /tests)
              <form action="/tests" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 xl:flex">
                <Search size={15} className="text-slate-400" />
                <input
                  name="q"
                  placeholder="Search exams, tests, topics..."
                  className="w-44 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
              </form>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className={iconBtn}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {!minimal && (
              <div className="hidden items-center gap-2 sm:flex">
                {user ? (
                  <>

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
                        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0B0F19]">
                          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fullName}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                          </div>

                          <div className="flex flex-col py-2">
                            <Link
                              href="/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <UserRound size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-200" />
                              <div>
                                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">My Profile</p>
                                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Personal details and account information</p>
                              </div>
                            </Link>

                            <Link
                              href="/history"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <ReceiptText size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-200" />
                              <div>
                                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">Orders & Payments</p>
                                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Receipts and payment status, if not already under My Learning</p>
                              </div>
                            </Link>
                            
                            <Link
                              href="/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <Settings size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-200" />
                              <div>
                                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">Account Settings</p>
                                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Security, preferences and session management</p>
                              </div>
                            </Link>

                            <Link
                              href="/faqs"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <CircleHelp size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-200" />
                              <div>
                                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">Help & Support</p>
                                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">FAQs and assistance</p>
                              </div>
                            </Link>

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <LogOut size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-200" />
                              <div>
                                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">Logout</p>
                                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">End the current session</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-600 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                      Sign up free
                    </Link>
                  </>
                )}
              </div>
            )}

            {!minimal && (
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            )}
          </div>
        </div>

        {!minimal && mobileOpen && (
          <div className="border-t border-slate-200 py-4 dark:border-slate-800 lg:hidden">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive(link.href)
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    My Profile
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center justify-center rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold text-white">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white">
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}