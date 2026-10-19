import Link from 'next/link';
import { BookOpen, PlayCircle, BarChart2, Trophy } from 'lucide-react';

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
                {/* Top Row: Circle with number on left, Icon on right */}
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300/90 bg-white text-xs font-bold text-slate-800 shadow-2xs transition-all duration-200 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:group-hover:border-zinc-200 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950">
                    {i + 1}
                  </span>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 transition-colors group-hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:text-white">
                    <Icon size={16} strokeWidth={2} />
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
            </Link>
          );
        })}
      </div>
    </section>
  );
}