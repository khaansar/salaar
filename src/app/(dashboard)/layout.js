'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logoutUser } from '../../store/slices/authSlice';
import {
  LogOut,
  LayoutDashboard,
  FolderTree,
  Library,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

const ADMIN_NAV = [
  { href: '/admin-dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin-dashboard/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin-dashboard/series', label: 'Test Series', icon: Library },
  { href: '/admin-dashboard/questions', label: 'Question Bank', icon: HelpCircle },
];

export default function DashboardLayout({ children }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const isAdminSection = pathname?.startsWith('/admin-dashboard');
  const nav = isAdminSection ? ADMIN_NAV : [];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white text-lg">
              P
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">PrepHub</span>
            {isAdminSection && (
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="px-4 py-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                {(user.name || user.email || 'A').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.email}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="font-bold text-lg text-slate-900">PrepHub</span>
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
