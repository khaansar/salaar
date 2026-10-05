import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';
import Link from 'next/link';

function Logo() {
  return (
    <svg viewBox="0 0 32 20" className="h-6 w-10" aria-hidden="true">
      <polygon points="0,20 8,2 16,14 24,2 32,20 26,20 24,13 16,20 8,13 6,20" fill="#5e43f3" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fc]">
      {/* Left Panel - Brand & Features (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden bg-white px-12 py-10 xl:px-20 border-r border-slate-100">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-400/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-sky-300/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <Logo />
            <span className="text-[22px] font-extrabold uppercase tracking-tight text-slate-900">
              Baahubali
            </span>
          </Link>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold mb-6 w-max">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
              Your Competitive Exam Partner
            </div>

            <h1 className="text-4xl xl:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.15] mb-6">
              Practice Smarter. <br />
              <span className="text-brand-600">Crack Your Exam.</span>
            </h1>
            
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl mb-12">
              High-quality mock tests, previous year papers, detailed solutions and AI-powered analytics to help you achieve your dream.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 max-w-xl mb-12">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 shadow-sm border border-brand-100">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Real Exam Pattern</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Latest and most accurate test patterns</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Detailed Analytics</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Identify strengths and weak areas</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Step-by-step Solutions</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Learn from detailed explanations</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 shadow-sm border border-rose-100">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Wide Range of Exams</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">SSC, Banking, Railway & more</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 max-w-xl relative">
              <div className="absolute -top-3 -left-2 text-4xl text-brand-200 font-serif leading-none">"</div>
              <p className="text-slate-600 text-sm italic relative z-10 mb-4">
                "Baahubali's mock tests are very close to the actual exam. The detailed solutions really helped me understand the concepts."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                  PV
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Priya Verma</p>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Banking Aspirant</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[1,2,3,4,5].map(star => <span key={star} className="text-amber-400 text-sm">★</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center relative p-4 sm:p-8">
        {/* Mobile Logo (hidden on desktop) */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>

        <div className="w-full max-w-[440px]">
          <Suspense fallback={<div className="text-center p-4">Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
