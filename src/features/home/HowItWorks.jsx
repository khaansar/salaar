import { FileText, PlayCircle, BarChart2, Trophy } from 'lucide-react';

const steps = [
  { icon: FileText, title: 'Choose your exam', text: 'Pick from a wide range of competitive exams.' },
  { icon: PlayCircle, title: 'Take mock tests', text: 'Practice on the real exam interface with real-pattern questions.' },
  { icon: BarChart2, title: 'Analyze performance', text: 'See detailed analysis and find your weak areas.' },
  { icon: Trophy, title: 'Improve and repeat', text: 'Focus on weak topics and keep raising your score.' },
];

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-zinc-800 dark:bg-[#121316]"
    >
      <h2 id="how-it-works-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        How it works
      </h2>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Start preparing in four steps.</p>

      <ol className="mt-8 grid lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={title} className="flex gap-4 lg:flex-col lg:gap-0">
              {/* Rail: vertical on mobile, horizontal on desktop */}
              <div className="flex flex-col items-center lg:flex-row">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                {!last && (
                  <span
                    aria-hidden="true"
                    className="my-2 min-h-6 w-px flex-1 bg-brand-100 dark:bg-slate-700 lg:mx-3 lg:my-0 lg:h-px lg:min-h-0 lg:w-auto"
                  />
                )}
              </div>

              <div className={`${last ? '' : 'pb-7'} lg:pb-0 lg:pr-6 lg:pt-5`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 max-w-[16rem] text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}