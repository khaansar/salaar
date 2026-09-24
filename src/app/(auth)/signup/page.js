import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto relative">
      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between p-6 sm:px-12 absolute top-0 left-0 right-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-slate-900 rounded-[6px] flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span className="font-semibold text-lg tracking-tight">PrepHub</span>
        </Link>
        <div className="text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-slate-900 hover:text-indigo-600 transition-colors">
            Log in
          </Link>
        </div>
      </header>

      {/* Centered Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 mt-16 sm:mt-0">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 mb-2">
              Create your account
            </h1>
            <p className="text-slate-500 text-[15px]">
              Start your preparation journey today.
            </p>
          </div>
          
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
