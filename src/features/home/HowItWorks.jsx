import Link from 'next/link';
import { BookOpen, PlayCircle, BarChart2, Trophy, ArrowRight, ArrowDown } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: 'Choose your exam',
    text: 'Pick from a wide range of competitive exams.',
    href: '/categories',
  },
  {
    icon: PlayCircle,
    title: 'Take mock tests',
    text: 'Practice on the real exam interface with real-pattern questions.',
    href: '/tests',
  },
  {
    icon: BarChart2,
    title: 'Analyze performance',
    text: 'See detailed analysis and find your weak areas.',
    href: '/analytics',
  },
  {
    icon: Trophy,
    title: 'Improve and repeat',
    text: 'Focus on weak topics and keep raising your score.',
    href: '/my-learning',
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mb-2 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-[#121316]"
    >
      <div className="pb-6 border-b border-slate-100 dark:border-zinc-800/80">
        <h2
          id="how-it-works-heading"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          How it works
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
          Start preparing in four steps.
        </p>
      </div>

      {/* Desktop View: Horizontal 4-Step Pipeline with Connecting Arrows */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 pt-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === steps.length - 1;

          return (
            <div key={s.title} className="relative flex flex-col items-center text-center group">
              {/* Connector line and arrow between circles */}
              {!isLast && (
                <div
                  className="absolute top-8 left-[calc(50%+38px)] right-[calc(-50%+38px)] flex items-center pointer-events-none z-0"
                  aria-hidden="true"
                >
                  <div className="h-[2px] w-full bg-slate-200 dark:bg-zinc-800 group-hover:bg-slate-300 dark:group-hover:bg-zinc-700 transition-colors" />
                  <ArrowRight size={15} className="text-slate-400 dark:text-zinc-600 -ml-1 shrink-0" />
                </div>
              )}

              {/* Step Circle */}
              <Link
                href={s.href}
                className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-200/90 bg-slate-50 text-slate-800 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-brand-600 group-hover:bg-white group-hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:group-hover:border-brand-500 dark:group-hover:bg-[#18191d] cursor-pointer"
              >
                <Icon size={24} className="text-slate-700 transition-colors group-hover:text-brand-600 dark:text-zinc-300 dark:group-hover:text-brand-400" />

                {/* Number Badge at Top-Left of Circle */}
                <span className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs transition-colors group-hover:bg-brand-600 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-brand-500 dark:group-hover:text-white">
                  {i + 1}
                </span>
              </Link>

              {/* Step Title & Description */}
              <Link href={s.href} className="mt-4 flex flex-col items-center cursor-pointer">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[210px]">
                  {s.text}
                </p>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet View: Vertical Step Pipeline with Downward Arrows */}
      <div className="flex flex-col lg:hidden pt-6">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === steps.length - 1;

          return (
            <div key={s.title} className="flex flex-col">
              <Link href={s.href} className="group flex items-start gap-4 cursor-pointer">
                {/* Step Circle */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-200/90 bg-slate-50 text-slate-800 shadow-2xs transition-all duration-300 group-hover:border-brand-600 group-hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:group-hover:border-brand-500">
                  <Icon size={22} className="text-slate-700 transition-colors group-hover:text-brand-600 dark:text-zinc-300 dark:group-hover:text-brand-400" />
                  <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white dark:bg-white dark:text-zinc-950 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 dark:group-hover:text-white">
                    {i + 1}
                  </span>
                </div>

                {/* Step Content */}
                <div className="pt-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {s.text}
                  </p>
                </div>
              </Link>

              {/* Connecting Down Arrow */}
              {!isLast && (
                <div className="flex items-center pl-6 py-2" aria-hidden="true">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-[2px] bg-slate-200 dark:bg-zinc-800" />
                    <ArrowDown size={14} className="text-slate-400 dark:text-zinc-600 -mt-0.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}