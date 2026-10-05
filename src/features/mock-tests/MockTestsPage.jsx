'use client';

import { useState } from 'react';
import MockTestsHero from './MockTestsHero';
import FilterSidebar from './FilterSidebar';
import ExamCategoryCards from './ExamCategoryCards';
import SeriesRow from './SeriesRow';
import TestExplorer from './TestExplorer';
import { useGetPublishedMockTestsQuery, useGetCategoriesQuery } from '../../store/catalogApi';

const PAGE_SIZE = 8;
const INITIAL = { q: '', cats: [], exams: [], type: 'full', langs: [], price: 'all' };

export default function MockTestsPage({ series = [] }) {
  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useGetCategoriesQuery();

  // Find the categoryId corresponding to the selected category slug (if one is selected)
  const selectedCat = categories.find((c) => filters.cats.includes(c.slug));
  const categoryId = selectedCat ? selectedCat.id : undefined;

  const { data: mockTestsData, isFetching } = useGetPublishedMockTestsQuery({
    categoryId,
    query: filters.q || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const update = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  
  const reset = () => {
    setFilters(INITIAL);
    setPage(1);
  };

  const tests = mockTestsData?.data || [];
  const meta = mockTestsData?.meta || { totalPages: 1 };
  const pages = meta.totalPages;

  return (
    <div className="pb-10">
      <MockTestsHero />
      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <FilterSidebar filters={filters} update={update} onClear={reset} />
        <div className="min-w-0">
          <ExamCategoryCards selected={filters.cats} onSelect={(cats) => update({ cats })} />
          <SeriesRow series={series} />
          <TestExplorer
            tests={tests}
            isFetching={isFetching}
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