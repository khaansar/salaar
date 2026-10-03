import Link from 'next/link';
import { ArrowRight, BarChart2, FileText, Clock, CheckCircle2, Landmark, TrainFront, MapPin } from 'lucide-react';

const ICONS = [
  { Icon: Landmark, color: 'text-emerald-600' },
  { Icon: TrainFront, color: 'text-rose-500' },
  { Icon: Landmark, color: 'text-amber-500' },
  { Icon: MapPin, color: 'text-blue-500' },
];
const BADGE = {
  popular: 'bg-emerald-50 text-emerald-700',
  new: 'bg-rose-50 text-rose-600',
  bestseller: 'bg-amber-50 text-amber-600',
};
const fmt = (m) => (!m ? null : m % 60 === 0 ? `${m / 60} hr${m / 60 === 1 ? '' : 's'}` : `${m} min`);

// Real data from catalogService.getPopularSeries(). Price / discount / validity show only if the API returns them.
export default function SeriesRow({ series = [] }) {
  if (!series.length) return null;
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <BarChart2 size={20} className="text-brand-600" /> Popular Test Series
        </h2>
        <Link href="/test-series" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All Test Series <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {series.map((item, i) => {
          const { Icon, color } = ICONS[i % ICONS.length];
          const duration = fmt(item.durationMinutes);
          return (
            <Link key={item.id} href={`/test-series/${item.slug}`} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-start justify-between">
                <Icon size={28} className={color} strokeWidth={1.8} />
                {item.badge && (
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${BADGE[String(item.badge).toLowerCase()] || 'bg-brand-50 text-brand-600'}`}>{item.badge}</span>
                )}
              </div>
              <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">{item.title}</h3>
              {item.subtitle && <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>}
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                {item.testCount != null && <li className="flex items-center gap-2"><FileText size={13} /> {item.testCount} Tests</li>}
                {duration && <li className="flex items-center gap-2"><Clock size={13} /> {duration}</li>}
                {item.validityMonths && <li className="flex items-center gap-2"><CheckCircle2 size={13} /> Valid for {item.validityMonths} Months</li>}
              </ul>
              {item.price != null && (
                <p className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">₹{item.price}</span>
                  {item.originalPrice && <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>}
                  {item.discountPercent && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{item.discountPercent}% OFF</span>}
                </p>
              )}
              <span className="mt-auto pt-4">
                <span className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand-600 py-2 text-xs font-semibold text-brand-600 group-hover:bg-brand-50">
                  View Details <ArrowRight size={13} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}