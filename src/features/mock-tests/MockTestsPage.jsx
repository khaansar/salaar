'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FilterSidebar from './FilterSidebar';
import SeriesRow from './SeriesRow';
import TestExplorer from './TestExplorer';
import {
  useGetPublishedMockTestsQuery,
  useGetCategoriesQuery,
} from '../../store/catalogApi';

const PAGE_SIZE = 9;

const INITIAL = {
  q: '',
  cats: [],
};

function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function MockTestsPage({ series = [] }) {
  const [filters, setFilters] = useState(INITIAL);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();

  const categories = toList(categoriesResponse);

  const selectedCategory = categories.find((category) => {
    const categoryKey = category.slug || category.id;
    return filters.cats.includes(categoryKey);
  });

  const categoryId = selectedCategory?.id;

  const {
    data: mockTestsResponse,
    isFetching,
    isError: testsError,
  } = useGetPublishedMockTestsQuery({
    categoryId,
    query: filters.q.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const tests = toList(mockTestsResponse?.data ?? mockTestsResponse);
  const meta = mockTestsResponse?.meta ?? {};
  const pages = Math.max(1, Number(meta.totalPages) || 1);

  // Debounce typing so the API is not called on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.q === searchText ? current : { ...current, q: searchText }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const selectCategories = (cats) => {
    setFilters((current) => ({ ...current, cats }));
    setPage(1);
  };

  const reset = () => {
    setFilters(INITIAL);
    setSearchText('');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Mock tests</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Practice full-length and topic-wise tests for your target exam.</p>
        </div>
        <Link href="/test-series" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Browse all test series
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <FilterSidebar
          search={searchText}
          onSearch={setSearchText}
          onClear={reset}
          categories={categories}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
          selected={filters.cats}
          onSelect={selectCategories}
        />

        <div className="min-w-0 space-y-10">
          <SeriesRow series={series} />

          <TestExplorer
            tests={tests}
            isFetching={isFetching}
            hasError={testsError}
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