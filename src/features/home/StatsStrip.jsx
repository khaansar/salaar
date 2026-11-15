import { FileText, Library, FolderTree, Star } from 'lucide-react';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function formatCount(value) {
  return value >= 1000 ? compact.format(value) : String(value);
}

function isCount(value) {
  return Number.isFinite(value) && value > 0;
}

// Keeps the strip evenly spread for however many live stats are available.
const MD_COLUMNS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

/**
 * Platform numbers shown on the homepage. Every value comes from live data;
 * a stat is hidden when its source is unavailable or empty, never faked.
 */
export default function StatsStrip({ mockTests, testSeries, categories, ratingAverage, ratingCount }) {
  const stats = [
    isCount(mockTests) && { icon: FileText, value: formatCount(mockTests), label: mockTests === 1 ? 'Mock Test' : 'Mock Tests' },
    isCount(testSeries) && { icon: Library, value: formatCount(testSeries), label: 'Test Series' },
    isCount(categories) && { icon: FolderTree, value: formatCount(categories), label: categories === 1 ? 'Exam Category' : 'Exam Categories' },
    isCount(ratingCount) &&
      Number.isFinite(ratingAverage) && {
        icon: Star,
        value: `${ratingAverage.toFixed(1)}/5`,
        label: 'Average Rating',
        fill: true,
      },
  ].filter(Boolean);

  if (stats.length === 0) return null;

  return (
    <section aria-label="Platform Statistics" className="py-2 px-2 sm:px-6 my-1">
      <div className={`grid grid-cols-2 ${MD_COLUMNS[stats.length]} gap-4 sm:gap-6`}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-between text-center select-none"
          >
            {/* Stat Item Content (No background box) */}
            <div className="my-2 flex items-center justify-center gap-2.5 py-1 px-2">
              <s.icon
                size={22}
                className={`shrink-0 ${
                  s.fill ? 'fill-amber-400 text-amber-400' : 'text-brand-600 dark:text-brand-400'
                }`}
              />
              <div className="text-left">
                <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  {s.value}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {s.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
