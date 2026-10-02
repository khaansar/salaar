import Link from 'next/link';
import { ArrowRight, FileText, Clock, CheckCircle2, BarChart2, Landmark, TrainFront, MapPin } from 'lucide-react';

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} min`;
}

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
  recommended: 'bg-emerald-50 text-emerald-700',
};

export default function PopularSeries({ series = [] }) {
  if (!Array.isArray(series) || series.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <BarChart2 size={20} className="text-brand-600" /> Featured Test Series
          </h2>
          <p className="mt-1 text-xs text-slate-500">Most popular and highly rated test series to boost your preparation.</p>
        </div>
        <Link href="/test-series" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All Test Series <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {series.map((item, i) => {
          const { Icon, color } = ICONS[i % ICONS.length];
          const duration = formatDuration(item.durationMinutes);
          return (
            <Link
              key={item.id}
              href={`/test-series/${item.slug}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-3 flex items-start justify-between">
                <Icon size={28} className={color} strokeWidth={1.8} />
                {item.badge && (
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${BADGE[String(item.badge).toLowerCase()] || 'bg-brand-50 text-brand-600'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">{item.title}</h3>
              {item.subtitle && <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>}

              <ul className="mt-4 space-y-2 text-xs text-slate-500">
                {item.testCount != null && (
                  <li className="flex items-center gap-2"><FileText size={14} /> {item.testCount} Tests</li>
                )}
                {duration && (
                  <li className="flex items-center gap-2"><Clock size={14} /> {duration}</li>
                )}
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Updated Regularly</li>
              </ul>

              <span className="mt-auto pt-4">
                <span className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand-600 py-2 text-xs font-semibold text-brand-600 transition-colors group-hover:bg-brand-50">
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