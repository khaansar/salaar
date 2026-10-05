'use client';

import { useState } from 'react';
import { Search, ChevronUp } from 'lucide-react';
import { EXAM_CATEGORIES, EXAMS, TYPES, LANGUAGES } from './mock/mockTestsMocks';

function Row({ checked, label, count, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-xs text-slate-700 dark:text-slate-300">
      <span className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-brand-600" />
        {label}
      </span>
      {count != null && <span className="text-[11px] text-slate-400">{count}</span>}
    </label>
  );
}

function Group({ title, children }) {
  return (
    <details open className="group border-t border-slate-100 py-4 first:border-t-0 dark:border-slate-800">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronUp size={15} className="text-slate-400 transition-transform group-[:not([open])]:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function FilterSidebar({ filters, update, onClear }) {
  const [examQuery, setExamQuery] = useState('');
  const [showAllExams, setShowAllExams] = useState(false);

  const exams = EXAMS.filter((e) => e.name.toLowerCase().includes(examQuery.toLowerCase()));
  const visibleExams = showAllExams || examQuery ? exams : exams.slice(0, 8);

  return (
    <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Filters</h2>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Clear All</button>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Search size={14} className="text-slate-400" />
        <input
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Search exams or test series..."
          className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
        />
      </div>

      <Group title="Exam Category">
        <Row label="All Exams" checked={filters.cats.length === 0} onChange={() => update({ cats: [] })} />
        {EXAM_CATEGORIES.map((c) => (
          <Row key={c.slug} label={c.name} count={c.examCount} checked={filters.cats.includes(c.slug)} onChange={() => update({ cats: toggle(filters.cats, c.slug) })} />
        ))}
      </Group>

      <Group title="Exam">
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input value={examQuery} onChange={(e) => setExamQuery(e.target.value)} placeholder="Search exam..." className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" />
        </div>
        {visibleExams.map((e) => (
          <Row key={e.name} label={e.name} checked={filters.exams.includes(e.name)} onChange={() => update({ exams: toggle(filters.exams, e.name) })} />
        ))}
        {!examQuery && exams.length > 8 && (
          <button type="button" onClick={() => setShowAllExams((v) => !v)} className="mt-1 text-xs font-semibold text-brand-600">
            {showAllExams ? 'Show Less' : 'Show More'}
          </button>
        )}
      </Group>

      <Group title="Test Type">
        <Row label="All" checked={filters.type === 'all'} onChange={() => update({ type: 'all' })} />
        {TYPES.map((t) => (
          <Row key={t.value} label={t.label.replace(' Tests', ' Tests')} checked={filters.type === t.value} onChange={() => update({ type: filters.type === t.value ? 'all' : t.value })} />
        ))}
      </Group>

      <Group title="Language">
        <Row label="All" checked={filters.langs.length === 0} onChange={() => update({ langs: [] })} />
        {LANGUAGES.map((l) => (
          <Row key={l} label={l === 'Bilingual' ? 'Bilingual (English + Hindi)' : l} checked={filters.langs.includes(l)} onChange={() => update({ langs: toggle(filters.langs, l) })} />
        ))}
      </Group>

      <Group title="Price">
        {['all', 'free', 'paid'].map((p) => (
          <Row key={p} label={p[0].toUpperCase() + p.slice(1)} checked={filters.price === p} onChange={() => update({ price: p })} />
        ))}
      </Group>
    </aside>
  );
}