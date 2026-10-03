import { Settings, FileText, PlayCircle, BarChart2, Trophy } from 'lucide-react';

const steps = [
  { icon: FileText, title: 'Choose Your Exam', text: 'Select from a wide range of competitive exams.' },
  { icon: PlayCircle, title: 'Take Mock Tests', text: 'Practice with real exam interface and questions.' },
  { icon: BarChart2, title: 'Analyze Performance', text: 'Get detailed analysis and identify weak areas.' },
  { icon: Trophy, title: 'Improve & Repeat', text: 'Focus on weak topics and keep improving.' },
];

export default function HowItWorks() {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <Settings size={20} className="text-brand-600" /> How It Works
      </h2>
      <p className="mt-1 text-xs text-slate-500">Start your preparation in just 4 simple steps.</p>
      <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex flex-col items-center text-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
            <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <s.icon size={24} />
            </span>
            {i < steps.length - 1 && (
              <span className="absolute left-[calc(50%+48px)] right-[calc(-50%+48px)] top-[38px] hidden border-t-2 border-dashed border-brand-100 lg:block" />
            )}
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{s.title}</h3>
            <p className="mt-1 max-w-[200px] text-xs leading-5 text-slate-500">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}