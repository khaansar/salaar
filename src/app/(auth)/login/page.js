import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Left Panel - Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-700 to-blue-600 opacity-90"></div>
        
        {/* Abstract floating shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-12 text-white max-w-xl">
          <Link href="/" className="flex items-center gap-3 mb-16 group inline-flex">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <span className="font-bold text-2xl tracking-tight">PrepHub</span>
          </Link>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Master your future, <br />
            <span className="text-indigo-200">one test at a time.</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium leading-relaxed">
            Join thousands of students upgrading their skills and cracking exams with our comprehensive testing platform.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-base">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}