import { Users, FileText, ThumbsUp, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '100K+', label: 'Students Trust Us' },
  { icon: FileText, value: '5K+', label: 'Mock Tests' },
  { icon: ThumbsUp, value: '95%', label: 'Recommend Us' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', fill: true },
];

/**
 * 2D Volumetric Up Arrow (White in Dark mode, Black/Slate-900 in Light mode)
 */
function VolumetricArrowUp({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 28"
      className={`w-8 sm:w-9 h-7 shrink-0 drop-shadow-xs ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 2L2 12H10V26H22V12H30L16 2Z"
        className="fill-slate-900 stroke-slate-900 dark:fill-white dark:stroke-white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 2D Volumetric Down Arrow (White in Dark mode, Black/Slate-900 in Light mode)
 */
function VolumetricArrowDown({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 28"
      className={`w-8 sm:w-9 h-7 shrink-0 drop-shadow-xs ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2H22V16H30L16 26L2 16H10V2Z"
        className="fill-slate-900 stroke-slate-900 dark:fill-white dark:stroke-white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatsStrip() {
  return (
    <section aria-label="Platform Statistics" className="py-2 px-2 sm:px-6 my-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-between text-center select-none"
          >
            {/* 2D Volumetric Up Arrow touching Steps above */}
            <div>
              <VolumetricArrowUp />
            </div>

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

            {/* 2D Volumetric Down Arrow touching Reviews below */}
            <div>
              <VolumetricArrowDown />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}