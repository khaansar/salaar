'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderTree,
  Library,
  HelpCircle,
  MessageCircleQuestion,
  Users,
  ShieldCheck,
  Star,
  Bell,
  ChevronDown,
  ChevronRight,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
} from 'lucide-react';

import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useTheme } from '../../hooks/useTheme';
import { logoutUser } from '../../store/slices/authSlice';
import { Avatar } from '../../components/ui/Avatar';
import PublicFooter from '../../components/student/PublicFooter';
import { BrandIcon, BrandText } from '../../components/common/BrandLogo';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin-dashboard/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin-dashboard/series', label: 'Test Series', icon: Library },
      { href: '/admin-dashboard/questions', label: 'Questions', icon: HelpCircle },
      { href: '/admin-dashboard/faqs', label: 'FAQs', icon: MessageCircleQuestion },
      { href: '/admin-dashboard/reviews', label: 'Review Moderation', icon: Star },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin-dashboard/users', label: 'Users', icon: Users },
      { href: '/admin-dashboard/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin-dashboard/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    ],
  },
];

// Routes that live outside a sidebar entry but should still show a title.
const EXTRA_ROUTES = [{ href: '/admin-dashboard/tests', label: 'Mock Tests', icon: FileText }];

function isItemActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname?.startsWith(`${item.href}/`);
}

function currentRoute(pathname) {
  const all = [...NAV_SECTIONS.flatMap((section) => section.items), ...EXTRA_ROUTES];
  return all.find((item) => isItemActive(pathname, item)) || NAV_SECTIONS[0].items[0];
}

/* ------------------------------------------------------------------ */
/* Collapsed-sidebar preference (per browser, survives reloads)        */
/* ------------------------------------------------------------------ */

const COLLAPSE_KEY = 'admin-sidebar-collapsed';
const COLLAPSE_EVENT = 'admin-sidebar-collapsed-change';

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function subscribeCollapsed(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(COLLAPSE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(COLLAPSE_EVENT, callback);
  };
}

function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);

  const setCollapsed = (next) => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this event.
    }
    window.dispatchEvent(new Event(COLLAPSE_EVENT));
  };

  return [collapsed, setCollapsed];
}

/** Closes a popover on outside click or Escape. */
function useDismiss(open, setOpen) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, setOpen]);

  return ref;
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

function NavItem({ item, pathname, collapsed, onNavigate }) {
  const Icon = item.icon;
  const active = isItemActive(pathname, item);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex h-9 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        collapsed ? 'justify-center' : 'gap-3 px-2.5'
      } ${
        active
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      {active && <span className="absolute -left-2.5 top-1.5 h-6 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />}
      <Icon size={18} strokeWidth={active ? 2.2 : 1.9} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function SidebarContent({ pathname, collapsed, onNavigate, onToggleCollapse, onClose }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <Link href="/admin-dashboard" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5" aria-label="Admin dashboard home">
          <BrandIcon size="sm" />
          {!collapsed && <BrandText size="sm" badge="Admin" />}
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
        {NAV_SECTIONS.map((section, index) => (
          <div key={section.label} className={index > 0 ? 'mt-5' : ''}>
            {collapsed ? (
              index > 0 && <div className="mx-auto mb-3 h-px w-6 bg-slate-200 dark:bg-slate-800" />
            ) : (
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-slate-200 p-2.5 dark:border-slate-800">
        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? 'View site' : undefined}
          aria-label={collapsed ? 'View site' : undefined}
          className={`flex h-9 items-center rounded-lg text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${collapsed ? 'justify-center' : 'gap-3 px-2.5'}`}
        >
          <ExternalLink size={18} className="shrink-0" />
          {!collapsed && <span>View site</span>}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-9 w-full items-center rounded-lg text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white ${collapsed ? 'justify-center' : 'gap-3 px-2.5'}`}
          >
            {collapsed ? <PanelLeftOpen size={18} className="shrink-0" /> : <PanelLeftClose size={18} className="shrink-0" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );
}

function DesktopSidebar({ pathname }) {
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  return (
    <aside
      className={`hidden h-dvh shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-900 md:block ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      <SidebarContent pathname={pathname} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
    </aside>
  );
}

function MobileSidebar({ pathname, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <aside className="relative h-dvh w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <SidebarContent pathname={pathname} collapsed={false} onNavigate={onClose} onClose={onClose} />
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

const HEADER_ICON_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200';

function PageContext({ pathname }) {
  const route = currentRoute(pathname);
  const Icon = route.icon;
  const isHome = route.href === '/admin-dashboard';

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300 sm:flex">
        <Icon size={16} />
      </span>
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        {!isHome && (
          <>
            <Link href="/admin-dashboard" className="hidden text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 lg:inline">
              Admin
            </Link>
            <ChevronRight size={14} className="hidden shrink-0 text-slate-300 dark:text-slate-600 lg:inline" />
          </>
        )}
        <span className="truncate font-semibold text-slate-900 dark:text-white">{route.label}</span>
      </div>
    </div>
  );
}

function QuestionSearch() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');

  // "/" focuses the search box unless the user is already typing somewhere.
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (typing) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/admin-dashboard/questions?search=${encodeURIComponent(term)}` : '/admin-dashboard/questions');
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={submit} role="search" className="relative hidden w-full max-w-xs md:block">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search questions…"
        aria-label="Search the question bank"
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500/50"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
        /
      </kbd>
    </form>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={HEADER_ICON_BUTTON}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
        className={HEADER_ICON_BUTTON}
      >
        <Bell size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
          </div>
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Bell size={18} />
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Admin';
  const role = user?.role ? String(user.role).replace(/_/g, ' ').toLowerCase() : '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800"
      >
        <Avatar name={fullName} avatarUrl={user?.avatarUrl} size="sm" />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[140px] truncate text-sm font-medium leading-tight text-slate-800 dark:text-slate-100">{fullName}</span>
          {role && <span className="block text-[11px] capitalize leading-tight text-slate-500 dark:text-slate-400">{role}</span>}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <Avatar name={fullName} avatarUrl={user?.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fullName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              {role && (
                <span className="mt-1 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {role}
                </span>
              )}
            </div>
          </div>
          <div className="py-1">
            <Link
              href="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink size={16} /> View site
            </Link>
          </div>
          <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
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

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
      <DesktopSidebar pathname={pathname} />
      <MobileSidebar pathname={pathname} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:px-5">
          <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" className={`${HEADER_ICON_BUTTON} md:hidden`}>
            <Menu size={20} />
          </button>

          <PageContext pathname={pathname} />

          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1">
            <QuestionSearch />
            <div className="mx-1.5 hidden h-6 w-px bg-slate-200 dark:bg-slate-800 md:block" />
            <ThemeToggle />
            <NotificationsMenu />
            <div className="mx-1.5 hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
            {user ? (
              <ProfileMenu user={user} onLogout={handleLogout} />
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            )}
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div>
          <PublicFooter />
        </main>
      </div>
    </div>
  );
}
