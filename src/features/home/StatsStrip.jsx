import { FileText, Library, FolderTree, Star } from 'lucide-react';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function formatCount(value) {
  return value >= 1000 ? compact.format(value) : String(value);
}

function isCount(value) {
  return Number.isFinite(value) && value > 0;
}

/**
 * Platform numbers shown on the homepage. Every value comes from live data;
 * a stat is hidden when its source is unavailable or empty, never faked.
 */
export default function StatsStrip({ mockTests, testSeries, categories, ratingAverage, ratingCount }) {
  const items = [
    isCount(mockTests) && { icon: FileText, value: formatCount(mockTests), label: mockTests === 1 ? 'Mock test' : 'Mock tests' },
    isCount(testSeries) && { icon: Library, value: formatCount(testSeries), label: 'Test series' },
    isCount(categories) && { icon: FolderTree, value: formatCount(categories), label: categories === 1 ? 'Exam category' : 'Exam categories' },
    isCount(ratingCount) &&
      Number.isFinite(ratingAverage) && {
        icon: Star,
        value: `${ratingAverage.toFixed(1)}/5`,
        label: `Average rating · ${formatCount(ratingCount)} review${ratingCount === 1 ? '' : 's'}`,
        star: true,
      },
  ].filter(Boolean);

  if (items.length === 0) return null;

  const columns = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[items.length];

  return (
    <section aria-label="Platform statistics" className="my-6">
      <dl className={`grid grid-cols-1 gap-3 sm:gap-4 ${columns}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs dark:border-zinc-800 dark:bg-[#121316]"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                item.star
                  ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-indigo-300'
              }`}
            >
              <item.icon size={20} className={item.star ? 'fill-current' : ''} />
            </span>
            <div className="flex min-w-0 flex-col-reverse">
              <dt className="truncate text-xs font-medium text-slate-500 dark:text-zinc-400">{item.label}</dt>
              <dd className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
