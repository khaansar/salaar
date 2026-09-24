import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Left Panel - Brand Showcase */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
        
        <div className="relative z-10 p-12 text-white max-w-xl">
          <Link href="/" className="flex items-center gap-3 mb-16 group inline-flex">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center transition-transform group-hover:-translate-y-1 shadow-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#312e81" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <span className="font-bold text-2xl tracking-tight">PrepHub</span>
          </Link>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Start your journey <br />
            <span className="text-indigo-400">to the top today.</span>
          </h1>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">✓</div>
              Access hundreds of mock tests
            </div>
            <div className="flex items-center gap-3 text-indigo-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">✓</div>
              Track progress with detailed analytics
            </div>
            <div className="flex items-center gap-3 text-indigo-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">✓</div>
              Learn from expert evaluators
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Create an account</h2>
            <p className="text-slate-500 text-base">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                Log in instead
              </Link>
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}