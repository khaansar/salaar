import Link from 'next/link';
import { BookOpen, PlayCircle, BarChart2, Trophy } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: 'Choose your exam',
    text: 'Pick from a wide range of competitive exams.',
    label: 'Choose',
    href: '/categories',
  },
  {
    icon: PlayCircle,
    title: 'Take mock tests',
    text: 'Practice on the real exam interface with real-pattern questions.',
    label: 'Practice',
    href: '/tests',
  },
  {
    icon: BarChart2,
    title: 'Analyze performance',
    text: 'See detailed analysis and find your weak areas.',
    label: 'Analyze',
    href: '/analytics',
  },
  {
    icon: Trophy,
    title: 'Improve and repeat',
    text: 'Focus on weak topics and keep raising your score.',
    label: 'Master',
    href: '/my-learning',
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-zinc-800 dark:bg-[#121316]"
    >
      <div>
        <h2
          id="how-it-works-heading"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          How it works
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Start preparing in four steps.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50/90 dark:border-zinc-800 dark:bg-[#18191d] dark:hover:border-zinc-700 dark:hover:bg-[#1c1d22] cursor-pointer"
            >
              <div>
                {/* Top Row: Numeral & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-slate-300 dark:text-zinc-700 group-hover:text-slate-900 dark:group-hover:text-white transition-colors select-none">
                    0{i + 1}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-colors group-hover:border-slate-300 group-hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:border-zinc-700 dark:group-hover:text-white">
                    <Icon size={19} strokeWidth={2} />
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {s.text}
                </p>
              </div>

              {/* Bottom: Minimalist Progress Flow */}
              <div className="mt-6 pt-3.5 border-t border-slate-200/60 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-zinc-500 mb-1.5">
                  <span>Step {i + 1} of 4</span>
                  <span className="font-semibold text-slate-600 dark:text-zinc-400">{s.label}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-200/70 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 dark:bg-zinc-300 transition-all duration-300"
                    style={{ width: `${(i + 1) * 25}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}