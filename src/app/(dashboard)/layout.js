'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../store/slices/authSlice';
import { LogOut, Home, Settings, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
// I actually need to import useAppSelector from hooks/useAppSelector
import { useAppSelector as useSelector } from '../../hooks/useAppSelector';

export default function DashboardLayout({ children }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white text-lg">
              P
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">PrepHub</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
              <Home size={18} />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
              <BookOpen size={18} />
              Courses
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
              <User size={18} />
              Profile
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
              <Settings size={18} />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="font-bold text-lg text-gray-900">PrepHub</span>
          </div>
          
          <div className="hidden md:block">
            {/* Search or breadcrumbs could go here */}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
