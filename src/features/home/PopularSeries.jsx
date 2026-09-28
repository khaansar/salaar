import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText, Clock } from 'lucide-react';

export default function PopularSeries({ series = [] }) {
  if (!series || series.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          🔥 Popular Test Series
        </h2>
        <Link href="/test-series" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {series.map((s) => (
          <Link
            key={s.id}
            href={`/test-series/${s.id}`}
            className="group flex flex-col bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="relative aspect-[2/1] bg-slate-100 dark:bg-slate-900 overflow-hidden">
              {s.badge && (
                <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  s.badge.toLowerCase() === 'popular' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  {s.badge}
                </div>
              )}
              {/* Fallback image text for mock without real images */}
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm">
                {s.thumbnailUrl?.split('/').pop()}
              </div>
              {/* 
              <Image
                src={s.thumbnailUrl}
                alt={s.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              /> 
              */}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2">
                {s.title}
              </h3>
              
              <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><FileText size={14} /> {s.testCount} Tests</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {s.durationMinutes / 60} hrs each</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
