'use client';

import { Search } from 'lucide-react';

function getCount(category) {
  const value = category?.examCount ?? category?.totalExams ?? category?.examCountTotal;
  if (value === null || value === undefined || value === '') return null;
  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

// Renders as a wrapping chip on mobile and as a full-width list row on desktop
function CategoryItem({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:w-full lg:rounded-lg lg:border-transparent lg:py-2 ${
        active
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 lg:border-transparent'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:bg-transparent lg:text-slate-700 lg:dark:bg-transparent'
      }`}
    >
      <span className="truncate text-left">{label}</span>
      {count !== null && (
        <span className={`text-xs ${active ? 'text-indigo-500 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>{count}</span>
      )}
    </button>
  );
}

export default function FilterSidebar({
  search,
  onSearch,
  onClear,
  categories = [],
  categoriesLoading = false,
  categoriesError = false,
  selected = [],
  onSelect,
}) {
  const dirty = Boolean(search) || selected.length > 0;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!dirty}
          className="text-sm font-medium text-indigo-600 hover:underline disabled:cursor-default disabled:text-slate-400 disabled:no-underline dark:text-indigo-400 dark:disabled:text-slate-600"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label htmlFor="mock-test-search" className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Search</label>
          <div className="relative">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="mock-test-search"
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Exams or tests…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Exam category</p>
          <div role="group" aria-label="Exam category" className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
            <CategoryItem active={selected.length === 0} label="All exams" count={null} onClick={() => onSelect([])} />

            {categoriesLoading ? (
              <p className="py-1 text-sm text-slate-500 dark:text-slate-400">Loading categories…</p>
            ) : categoriesError ? (
              <p className="py-1 text-sm text-slate-500 dark:text-slate-400">Unable to load categories.</p>
            ) : (
              categories.map((category) => {
                const key = category.slug || category.id;
                const active = selected.includes(key);

                return (
                  <CategoryItem
                    key={category.id || key}
                    active={active}
                    label={category.name || category.title || 'Category'}
                    count={getCount(category)}
                    onClick={() => onSelect(active ? [] : [key])}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}