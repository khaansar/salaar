import { SignupForm } from '@/components/auth/SignupForm';
import { Suspense } from 'react';
import Link from 'next/link';

function Logo() {
  return (
    <svg viewBox="0 0 32 20" className="h-6 w-10" aria-hidden="true">
      <polygon points="0,20 8,2 16,14 24,2 32,20 26,20 24,13 16,20 8,13 6,20" fill="#5e43f3" />
    </svg>
  );
}

export default function SignupPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-x-hidden bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
        
        {/* Glowing orbs */}
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-brand-400/10 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-400/10 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-1/4 left-2/3 h-[400px] w-[400px] rounded-full bg-sky-300/10 blur-[100px] mix-blend-multiply"></div>
      </div>

      {/* Floating Design Elements (Hidden on smaller screens) */}
      <div className="hidden xl:block absolute left-[8%] top-[25%] -rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105 z-0">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl">🎓</div>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-tight">100K+</p>
            <p className="text-slate-500 text-xs font-medium">Students Trust Us</p>
          </div>
        </div>
      </div>

      <div className="hidden xl:block absolute right-[8%] top-[30%] rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105 z-0">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">⭐</div>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-tight">4.8/5</p>
            <p className="text-slate-500 text-xs font-medium">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="hidden xl:block absolute left-[12%] bottom-[25%] rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105 z-0">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">📊</div>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-tight">50K+</p>
            <p className="text-slate-500 text-xs font-medium">Mock Tests</p>
          </div>
        </div>
      </div>
      
      <div className="hidden xl:block absolute right-[12%] bottom-[20%] -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105 z-0">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-2xl">🎯</div>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-tight">15+</p>
            <p className="text-slate-500 text-xs font-medium">Exam Categories</p>
          </div>
        </div>
      </div>

      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 z-20 hidden md:block">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
            Baahubali
          </span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        <Suspense fallback={<div className="text-center p-4">Loading form...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
