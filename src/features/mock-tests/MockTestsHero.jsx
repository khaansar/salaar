import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Monitor, Lightbulb, BarChart2, GraduationCap, FileText, Languages } from 'lucide-react';

function Chip({ icon: Icon, tone, label, className }) {
  return (
    <span className={`absolute hidden items-center gap-2 rounded-lg border border-white bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-800 shadow-md shadow-indigo-500/10 md:flex ${className}`}>
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tone}`}><Icon size={13} /></span>
      {label}
    </span>
  );
}

export default function MockTestsHero() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={12} />
        <span className="font-medium text-slate-700">Mock Tests</span>
      </nav>

      <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-[#f6f4ff] to-[#ebe7ff] dark:border-white/5 dark:from-slate-900 dark:via-indigo-950/40 dark:to-purple-950/40">
        <div className="grid items-center gap-4 px-6 py-8 sm:px-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Find the Right Mock Tests <span className="text-brand-600">for Your Exam</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Choose from a wide range of exams, test series and individual mock tests. Practice with real exam pattern, detailed solutions and performance analysis.
            </p>
          </div>
          <div className="relative h-56 sm:h-64">
            <div className="absolute inset-0 md:inset-x-24">
              <Image src="/images/home/hero-student.svg" alt="" fill priority unoptimized className="object-contain" />
            </div>
            <Chip icon={Monitor} tone="bg-brand-50 text-brand-600" label="Real Exam Pattern" className="left-0 top-4" />
            <Chip icon={Lightbulb} tone="bg-amber-100 text-amber-500" label="Detailed Solutions" className="left-0 top-24" />
            <Chip icon={BarChart2} tone="bg-blue-100 text-blue-600" label="Track Progress" className="left-4 top-44" />
            <Chip icon={GraduationCap} tone="bg-blue-100 text-blue-600" label="All Major Exams" className="right-0 top-0" />
            <Chip icon={FileText} tone="bg-brand-50 text-brand-600" label="Topic-wise Tests" className="right-0 top-20" />
            <Chip icon={Languages} tone="bg-brand-50 text-brand-600" label="Bilingual Support" className="right-0 top-40" />
          </div>
        </div>
      </section>
    </>
  );
}