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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Decorative Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
        
        {/* Glowing orbs */}
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-brand-400/10 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-400/10 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-1/4 left-2/3 h-[400px] w-[400px] rounded-full bg-sky-300/10 blur-[100px] mix-blend-multiply"></div>
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
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
