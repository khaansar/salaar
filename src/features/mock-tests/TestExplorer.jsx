import { ArrowRight, ChevronLeft, ChevronRight, FileText, Clock, Languages, HelpCircle } from 'lucide-react';
import StartTestButton from '../catalog/StartTestButton';
import { TYPES } from './mock/mockTestsMocks';

const TYPE_TONE = {
  full: 'bg-emerald-50 text-emerald-600',
  topic: 'bg-brand-50 text-brand-600',
  sectional: 'bg-amber-50 text-amber-500',
  pyp: 'bg-rose-50 text-rose-500',
};

function TestCard({ t }) {
  const type = TYPES.find((x) => x.value === t.type);
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TYPE_TONE[t.type]}`}><FileText size={20} /></span>
        <div className="min-w-0">
          <h3 className="text-xs font-bold leading-4 text-slate-900 dark:text-white">{t.series}</h3>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.name}</p>
          <span className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">{type?.short}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-[11px] text-slate-500">
        <li className="flex items-center gap-2"><HelpCircle size={13} /> {t.questions} Questions</li>
        <li className="flex items-center gap-2"><Clock size={13} /> {t.minutes} Minutes</li>
        <li className="flex items-center gap-2"><Languages size={13} /> {t.languages.join(' + ')}</li>
      </ul>
      <p className="mt-3 text-xs font-bold">
        {t.price === 0 ? <span className="text-emerald-600">Free</span> : (
          <span className="flex items-center justify-between"><span className="text-amber-500">Paid</span><span className="text-slate-900 dark:text-white">₹{t.price}</span></span>
        )}
      </p>
      <div className="mt-3">
        <StartTestButton testId={t.id} durationMinutes={t.minutes} variant="outline" />
      </div>
    </div>
  );
}

export default function TestExplorer({ tests, type, onType, page, pages, onPage, onReset }) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => Math.abs(n - page) <= 2 || n === 1 || n === pages);
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <FileText size={20} className="text-brand-600" /> Explore Tests
        </h2>
        <button type="button" onClick={() => onType('all')} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All Tests <ArrowRight size={14} />
        </button>
      </div>

      <div className="mb-5 flex gap-6 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {TYPES.map((t) => (
          <button key={t.value} type="button" onClick={() => onType(t.value)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-xs font-semibold ${type === t.value ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tests.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-white">No tests match your filters</p>
          <button type="button" onClick={onReset} className="mt-2 text-xs font-semibold text-brand-600">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tests.map((t) => <TestCard key={t.id} t={t} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40"><ChevronLeft size={15} /></button>
          {nums.map((n) => (
            <button key={n} type="button" onClick={() => onPage(n)} className={`h-8 w-8 rounded-md text-xs font-semibold ${n === page ? 'bg-brand-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-brand-600'}`}>{n}</button>
          ))}
          <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onPage(page + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40"><ChevronRight size={15} /></button>
        </div>
      )}
    </section>
  );
}