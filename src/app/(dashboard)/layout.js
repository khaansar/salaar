'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useTheme } from '../../hooks/useTheme';
import { logoutUser } from '../../store/slices/authSlice';
import { Avatar } from '../../components/ui/Avatar';
import {
  LogOut,
  LayoutDashboard,
  FolderTree,
  Library,
  HelpCircle,
  Bell,
  ChevronDown,
  Users,
  BarChart3,
  FileBarChart,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';

const CONTENT_NAV = [
  { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
];

const CONTENT_MANAGEMENT_NAV = [
  { href: '/admin-dashboard/categories', label: 'Exam Categories', icon: FolderTree },
  { href: '/admin-dashboard/series', label: 'Test Series', icon: Library },
  { href: '/admin-dashboard/questions', label: 'Question Bank', icon: HelpCircle },
];

// These groups mirror the reference design's information architecture, but
// there is no backing API for admin-user management or analytics yet, so the
// links are shown as disabled "coming soon" entries rather than dead links.
const USERS_NAV = [{ label: 'Users', icon: Users }];
const REPORTS_NAV = [
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Reports', icon: FileBarChart },
];

function NavLink({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

function DisabledNavItem({ item }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-400 dark:text-slate-600 cursor-not-allowed select-none">
      <span className="flex items-center gap-3">
        <Icon size={18} />
        {item.label}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 px-1.5 py-0.5 rounded">
        Soon
      </span>
    </div>
  );
}

function SidebarContent({ pathname, isAdminSection }) {
  const isActive = (item) => (item.exact ? pathname === item.href : pathname?.startsWith(item.href));

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white text-lg">
            T
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">TestHub</span>
          {isAdminSection && (
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300 px-1.5 py-0.5 rounded">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-1">
          {CONTENT_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item)} />
          ))}
        </nav>

        {isAdminSection && (
          <>
            <div className="px-6 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Content Management
            </div>
            <nav className="px-4 space-y-1">
              {CONTENT_MANAGEMENT_NAV.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item)} />
              ))}
            </nav>

            <div className="px-6 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Users
            </div>
            <nav className="px-4 space-y-1">
              {USERS_NAV.map((item) => (
                <DisabledNavItem key={item.label} item={item} />
              ))}
            </nav>

            <div className="px-6 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Reports
            </div>
            <nav className="px-4 space-y-1">
              {REPORTS_NAV.map((item) => (
                <DisabledNavItem key={item.label} item={item} />
              ))}
            </nav>
          </>
        )}
      </div>
    </>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg py-3 z-30">
          <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
          </div>
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Admin';
  const role = user?.role ? String(user.role).replace(/_/g, ' ').toLowerCase() : '';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Avatar name={fullName} avatarUrl={user?.avatarUrl} size="sm" />
        <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
          {fullName}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg py-2 z-30">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Avatar name={fullName} avatarUrl={user?.avatarUrl} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              {role && (
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                  {role}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAdminSection = pathname?.startsWith('/admin-dashboard');

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar (desktop) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
        <SidebarContent pathname={pathname} isAdminSection={isAdminSection} />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative w-64 h-full bg-white dark:bg-slate-900 flex flex-col shadow-xl">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <SidebarContent pathname={pathname} isAdminSection={isAdminSection} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 px-4 sm:px-6 shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <NotificationsMenu />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            {user ? (
              <ProfileMenu user={user} onLogout={handleLogout} />
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}