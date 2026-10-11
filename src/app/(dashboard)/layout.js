'use client';

import { useEffect, useRef, useState } from 'react';
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
  BarChart3,
  FileBarChart,
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useTheme } from '../../hooks/useTheme';
import { logoutUser } from '../../store/slices/authSlice';
import { Avatar } from '../../components/ui/Avatar';
import PublicFooter from '../../components/student/PublicFooter';
import { BrandIcon, BrandText } from '../../components/common/BrandLogo';

const OVERVIEW_NAV = [
  { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
];

const CONTENT_NAV = [
  { href: '/admin-dashboard/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin-dashboard/series', label: 'Test Series', icon: Library },
  { href: '/admin-dashboard/questions', label: 'Questions', icon: HelpCircle },
  { href: '/admin-dashboard/faqs', label: 'FAQs', icon: MessageCircleQuestion },
  { href: '/admin-dashboard/reviews', label: 'Review Moderation', icon: Star },
];

const USERS_NAV = [
  { href: '/admin-dashboard/users', label: 'Users', icon: Users },
];

const SECURITY_NAV = [
  { href: '/admin-dashboard/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
];

function isItemActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname?.startsWith(item.href);
}

function NavItem({ item, pathname, expanded, onNavigate }) {
  const Icon = item.icon;
  const active = isItemActive(pathname, item);

  return (
    <Link href={item.href} onClick={onNavigate} title={!expanded ? item.label : undefined} className={`group relative flex h-9 w-full items-center rounded-lg transition-colors duration-150 ${expanded ? 'gap-2.5 px-2' : 'justify-center px-0'} ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}>
      {active && <span className="absolute left-0 top-1.5 h-6 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center"><Icon size={17} strokeWidth={active ? 2.1 : 1.8} /></span>
      <span className={`overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-150 ${expanded ? 'w-auto translate-x-0 opacity-100' : 'pointer-events-none w-0 -translate-x-1 opacity-0'}`}>{item.label}</span>
      {!expanded && <span className="pointer-events-none absolute left-[calc(100%+8px)] z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-100 group-hover:opacity-100 dark:bg-white dark:text-slate-900">{item.label}</span>}
    </Link>
  );
}

function DisabledNavItem({ item, expanded }) {
  const Icon = item.icon;

  return (
    <div title={!expanded ? `${item.label} — Coming soon` : undefined} className={`group relative flex h-9 w-full items-center rounded-lg text-slate-300 dark:text-slate-700 ${expanded ? 'gap-2.5 px-2' : 'justify-center px-0'}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center"><Icon size={17} /></span>
      <span className={`overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-150 ${expanded ? 'w-auto opacity-100' : 'pointer-events-none w-0 -translate-x-1 opacity-0'}`}>{item.label}</span>
      {expanded && <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800 dark:text-slate-600">Soon</span>}
      {!expanded && <span className="pointer-events-none absolute left-[calc(100%+8px)] z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-100 group-hover:opacity-100 dark:bg-white dark:text-slate-900">{item.label} · Soon</span>}
    </div>
  );
}

function SidebarSection({ label, items, pathname, expanded, onNavigate }) {
  return (
    <section className="mb-3">
      <div className={`mb-1 overflow-hidden px-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-all duration-150 dark:text-slate-500 ${expanded ? 'h-3.5 opacity-100' : 'h-0 opacity-0'}`}>{label}</div>
      <div className="space-y-0.5">{items.map((item) => <NavItem key={item.href} item={item} pathname={pathname} expanded={expanded} onNavigate={onNavigate} />)}</div>
    </section>
  );
}

function SidebarContent({ pathname, expanded, onNavigate }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${expanded ? 'px-3' : 'justify-center'}`}>
        <Link href="/admin-dashboard" onClick={onNavigate} className="flex items-center gap-2.5 overflow-hidden">
          <BrandIcon size="sm" />
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-150 ${expanded ? 'w-auto opacity-100' : 'pointer-events-none w-0 opacity-0'}`}><BrandText size="sm" badge="Admin" /></div>
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-3">
        <SidebarSection label="Overview" items={OVERVIEW_NAV} pathname={pathname} expanded={expanded} onNavigate={onNavigate} />
        <SidebarSection label="Content" items={CONTENT_NAV} pathname={pathname} expanded={expanded} onNavigate={onNavigate} />
        <SidebarSection label="Users" items={USERS_NAV} pathname={pathname} expanded={expanded} onNavigate={onNavigate} />
        <SidebarSection label="Security" items={SECURITY_NAV} pathname={pathname} expanded={expanded} onNavigate={onNavigate} />
        <SidebarSection
            label="Payments"
            items={[
                {
                href: '/admin-dashboard/payments',
                label: 'Payments',
                icon: CreditCard,
                },
            ]}
            pathname={pathname}
            expanded={expanded}
            onNavigate={onNavigate}
            />
      </div>
    </div>
  );
}

function DesktopSidebar({ pathname }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="relative hidden h-dvh w-14 shrink-0 md:block" onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      <div className={`absolute left-0 top-0 z-40 h-dvh overflow-hidden border-r border-slate-200 bg-white transition-[width,box-shadow] duration-200 dark:border-slate-800 dark:bg-slate-900 ${expanded ? 'w-56 shadow-xl' : 'w-14 shadow-none'}`}>
        <SidebarContent pathname={pathname} expanded={expanded} />
      </div>
    </aside>
  );
}

function MobileSidebar({ pathname, open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <aside className="relative h-dvh w-64 bg-white shadow-xl dark:bg-slate-900">
        <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"><X size={17} /></button>
        <SidebarContent pathname={pathname} expanded onNavigate={onClose} />
      </aside>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} title={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"><Bell size={17} /></button>
      {open && <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"><div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800"><p className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</p></div><div className="px-3 py-7 text-center"><p className="text-xs text-slate-500 dark:text-slate-400">You&apos;re all caught up.</p></div></div>}
    </div>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Admin';
  const role = user?.role ? String(user.role).replace(/_/g, ' ').toLowerCase() : '';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
        <Avatar name={fullName} avatarUrl={user?.avatarUrl} size="sm" />
        <span className="hidden max-w-[120px] truncate text-xs font-medium text-slate-700 dark:text-slate-200 sm:block">{fullName}</span>
        <ChevronDown size={13} className="text-slate-400" />
      </button>
      {open && <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
          <Avatar name={fullName} avatarUrl={user?.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{fullName}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">{user?.email}</p>
            {role && <span className="mt-1 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">{role}</span>}
          </div>
        </div>
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><LogOut size={15} />Log out</button>
      </div>}
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
        <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:px-5">
          <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"><Menu size={19} /></button>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificationsMenu />
            <div className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
            {user ? <ProfileMenu user={user} onLogout={handleLogout} /> : <button type="button" onClick={handleLogout} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"><LogOut size={15} /><span className="hidden sm:inline">Log out</span></button>}
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5">{children}</div>
          <PublicFooter />
        </main>
      </div>
    </div>
  );
}
