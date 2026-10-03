'use client';

import { useMemo, useState } from 'react';
import MockTestsHero from './MockTestsHero';
import FilterSidebar from './FilterSidebar';
import ExamCategoryCards from './ExamCategoryCards';
import SeriesRow from './SeriesRow';
import TestExplorer from './TestExplorer';
import { TESTS } from './mock/mockTestsMocks';

const PAGE_SIZE = 8;
const INITIAL = { q: '', cats: [], exams: [], type: 'full', langs: [], price: 'all' };

const matchLang = (t, langs) =>
  langs.length === 0 ||
  langs.some((l) => (l === 'Bilingual' ? t.languages.length > 1 : t.languages.includes(l)));

export default function MockTestsPage({ series = [] }) {
  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);

  const update = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const reset = () => {
    setFilters(INITIAL);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return TESTS.filter(
      (t) =>
        (!q || `${t.series} ${t.name}`.toLowerCase().includes(q)) &&
        (filters.cats.length === 0 || filters.cats.includes(t.cat)) &&
        (filters.exams.length === 0 || filters.exams.includes(t.exam)) &&
        (filters.type === 'all' || t.type === filters.type) &&
        matchLang(t, filters.langs) &&
        (filters.price === 'all' || (filters.price === 'free' ? t.price === 0 : t.price > 0))
    );
  }, [filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="pb-10">
      <MockTestsHero />
      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <FilterSidebar filters={filters} update={update} onClear={reset} />
        <div className="min-w-0">
          <ExamCategoryCards selected={filters.cats} onSelect={(cats) => update({ cats })} />
          <SeriesRow series={series} />
          <TestExplorer
            tests={visible}
            type={filters.type}
            onType={(type) => update({ type })}
            page={page}
            pages={pages}
            onPage={setPage}
            onReset={reset}
          />
        </div>
      </div>
    </div>
  );
}