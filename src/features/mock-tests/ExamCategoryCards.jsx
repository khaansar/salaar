import { Building2, Landmark, TrainFront, GraduationCap, MapPin, ShieldCheck, Settings, Stethoscope, Layers, ArrowRight } from 'lucide-react';
import { EXAM_CATEGORIES } from './mock/mockTestsMocks';

const ICONS = { Building2, Landmark, TrainFront, GraduationCap, MapPin, ShieldCheck, Settings, Stethoscope };

export default function ExamCategoryCards({ selected, onSelect }) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Layers size={20} className="text-brand-600" /> Exam Categories
        </h2>
        <button type="button" onClick={() => onSelect([])} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All Categories <ArrowRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {EXAM_CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon];
          const active = selected.includes(c.slug);
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect(active ? [] : [c.slug])}
              className={`flex flex-col items-center rounded-xl border bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950 ${active ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <Icon size={30} className={c.tone} strokeWidth={1.8} />
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{c.name}</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">{c.desc}</p>
              <span className="mt-3 rounded-md bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600">{c.examCount} Exams</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}