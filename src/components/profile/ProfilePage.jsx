'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  Target,
} from 'lucide-react';

import { useAppSelector } from '../../hooks/useAppSelector';
import {
  useGetAttemptHistoryQuery,
  useGetUserPerformanceQuery,
  useGetYearlyStreakQuery,
} from '../../store/userApi';

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getScore = (attempt) => {
  const score = Number(attempt?.finalScore);
  return Number.isFinite(score) ? score : null;
};

const getStatusClasses = (status) => {
  const normalized = String(status || '').toUpperCase();

  if (normalized === 'SUBMITTED') {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  }

  if (normalized === 'EXPIRED') {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
  }

  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  const {
    data: streak,
    isLoading: streakLoading,
    isFetching: streakFetching,
  } = useGetYearlyStreakQuery();

  const {
    data: historyResponse,
    isLoading: historyLoading,
  } = useGetAttemptHistoryQuery({
    page: 1,
    perPage: 20,
  });

  const {
    data: performance,
    isLoading: performanceLoading,
  } = useGetUserPerformanceQuery();

  const attempts = useMemo(() => {
    if (Array.isArray(historyResponse)) {
      return historyResponse;
    }

    if (Array.isArray(historyResponse?.items)) {
      return historyResponse.items;
    }

    if (Array.isArray(historyResponse?.data)) {
      return historyResponse.data;
    }

    return [];
  }, [historyResponse]);

  const recentAttempts = attempts.slice(0, 4);

  const performanceSummary = performance?.summary;
  const performanceAttempts = Array.isArray(performance?.attempts)
    ? performance.attempts
    : [];

  const recentAverage = performanceSummary?.averageScorePercentage ?? null;

  const bestScore = performanceSummary?.bestScorePercentage ?? null;

  const completedAttempts =
    performanceSummary?.totalAttempts ?? 0;

  const chartAttempts = useMemo(
    () =>
      performanceAttempts
        .filter(
          (attempt) =>
            attempt?.scorePercentage !== null &&
            attempt?.scorePercentage !== undefined
        )
        .slice(-8),
    [performanceAttempts]
  );

  const fullName =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ') ||
    user?.name ||
    'Student';

  const email = user?.email || '—';

  const initial = (
    user?.firstName?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase();

  const joinedDate =
    user?.createdAt ||
    user?.joinedAt ||
    user?.created_at;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4 pb-6">
      {/* Profile header */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {initial}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-slate-950 dark:text-white">
                  {fullName}
                </h1>

                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  Student
                </span>
              </div>

              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                {email}
              </p>

              {joinedDate && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Member since {formatDate(joinedDate)}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/tests"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Take a test
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Activity */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame
                  size={17}
                  className="text-amber-500"
                />

                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Streak
                </span>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold leading-none tracking-tight text-slate-950 dark:text-white">
                  {streak?.currentStreak || 0}
                </span>

                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  day{(streak?.currentStreak || 0) === 1 ? '' : 's'} streak
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Your test activity over the past year
              </p>
            </div>

            <div className="flex gap-2">
              <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Active
                </p>

                <p className="mt-0.5 text-base font-bold text-slate-950 dark:text-white">
                  {streak?.totalActiveDays || 0}
                </p>
              </div>

              <div className="hidden rounded-lg border border-slate-200 px-3 py-2 sm:block dark:border-slate-700">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Best
                </p>

                <p className="mt-0.5 text-base font-bold text-slate-950 dark:text-white">
                  {streak?.maxStreak || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {streakLoading ? (
              <div className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : (
              <ActivityHeatmap streak={streak} />
            )}
          </div>
        </div>
      </section>

      {/* Bottom content */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Performance */}
        <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target
                    size={16}
                    className="text-indigo-500"
                  />

                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Performance
                  </h2>
                </div>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Based on all your completed attempts
                </p>
              </div>

              <Link
                href="/history"
                className="hidden items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 sm:flex"
              >
                View history
                <ArrowRight size={13} />
              </Link>
            </div>

            {performanceLoading ? (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((item) => (
                  <div key={item}>
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recent avg
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                    {recentAverage !== null
                      ? `${Math.round(
                          Number(recentAverage)
                        )}%`
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Best
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                    {bestScore !== null
                      ? `${Math.round(Number(bestScore))}%`
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Completed
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                    {completedAttempts}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 h-24 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/30">
              {performanceLoading ? (
                <div className="h-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              ) : chartAttempts.length >= 2 ? (
                <ScoreChart attempts={chartAttempts} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Complete more scored tests to reveal your trend
                </div>
              )}
            </div>

            <Link
              href="/history"
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 sm:hidden"
            >
              View history
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* Recent activity */}
        <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3
                    size={16}
                    className="text-indigo-500"
                  />

                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent activity
                  </h2>
                </div>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Your latest attempts
                </p>
              </div>

              <Link
                href="/history"
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600"
              >
                View all
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {historyLoading ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : recentAttempts.length ? (
                recentAttempts.map((attempt) => {
                  const score = getScore(attempt);

                  return (
                    <Link
                      key={attempt.attemptId}
                      href={`/attempt/${attempt.attemptId}/result`}
                      className="flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        {String(attempt.status || '').toUpperCase() ===
                        'SUBMITTED' ? (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-500"
                          />
                        ) : (
                          <Clock3
                            size={15}
                            className="text-slate-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {attempt.testName || 'Test attempt'}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {attempt.categoryName || 'Test'} ·{' '}
                          {formatDateTime(
                            attempt.startedAt ||
                              attempt.createdAt
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {score !== null ? (
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {score}%
                          </p>
                        ) : (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${getStatusClasses(
                              attempt.status
                            )}`}
                          >
                            {attempt.status || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent attempts yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="text-center text-[10px] text-slate-400">
        {completedAttempts} total test
        {completedAttempts === 1 ? '' : 's'} recorded
        {streakFetching ? ' · Updating activity…' : ''}
      </div>
    </div>
  );
}

function ScoreChart({ attempts }) {
  const scores = attempts.map(
    (attempt) => Number(attempt?.scorePercentage) || 0
  );

  const width = 600;
  const height = 90;
  const padding = 8;
  const min = Math.max(0, Math.min(...scores) - 10);
  const max = Math.min(100, Math.max(...scores) + 10);
  const range = Math.max(max - min, 1);

  const points = scores
    .map((score, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) /
          Math.max(scores.length - 1, 1);

      const y =
        height -
        padding -
        ((score - min) / range) *
          (height - padding * 2);

      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-label="Score trend"
    >
      <line
        x1="0"
        y1={height - 1}
        x2={width}
        y2={height - 1}
        stroke="currentColor"
        strokeOpacity="0.08"
      />

      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-indigo-500"
      />

      {scores.map((score, index) => {
        const x =
          padding +
          (index * (width - padding * 2)) /
            Math.max(scores.length - 1, 1);

        const y =
          height -
          padding -
          ((score - min) / range) *
            (height - padding * 2);

        return (
          <circle
            key={`${score}-${index}`}
            cx={x}
            cy={y}
            r="3"
            className="fill-indigo-500"
          />
        );
      })}
    </svg>
  );
}

function ActivityHeatmap({ streak }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const { today, firstDate, weeks } = useMemo(() => {
    const current = startOfDay(new Date());
    const start = new Date(current);
    start.setDate(current.getDate() - (DAY_COUNT - 1));

    const firstSunday = new Date(start);
    firstSunday.setDate(
      start.getDate() - start.getDay()
    );

    const days = [];

    for (let i = 0; i < 371; i += 1) {
      const date = new Date(firstSunday);
      date.setDate(firstSunday.getDate() + i);
      days.push(date);
    }

    const calendarWeeks = [];

    for (let i = 0; i < days.length; i += 7) {
      calendarWeeks.push(days.slice(i, i + 7));
    }

    return {
      today: current,
      firstDate: start,
      weeks: calendarWeeks,
    };
  }, []);

  const activityMap = useMemo(() => {
    const map = new Map();

    if (!Array.isArray(streak?.activity)) {
      return map;
    }

    streak.activity.forEach((item) => {
      if (item?.date) {
        map.set(item.date, Number(item.count) || 0);
      }
    });

    return map;
  }, [streak]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let previousMonth = -1;

    weeks.forEach((week, index) => {
      const month = week[0].getMonth();

      if (month !== previousMonth) {
        labels.push({
          index,
          label: week[0].toLocaleDateString(undefined, {
            month: 'short',
          }),
        });

        previousMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  const selectedActivity = selectedDate
    ? activityMap.get(toDateKey(selectedDate)) || 0
    : 0;

  return (
    <div>
      <div className="w-full overflow-hidden">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[680px] p-2 sm:min-w-0">
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
              }}
            >
              {weeks.map((_, index) => {
                const label = monthLabels.find(
                  (item) => item.index === index
                );

                return (
                  <div
                    key={index}
                    className="h-3 whitespace-nowrap text-[9px] font-semibold text-slate-400"
                  >
                    {label?.label}
                  </div>
                );
              })}
            </div>

            <div
              className="mt-1 grid grid-flow-col grid-rows-7 gap-[3px]"
              style={{
                gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
              }}
            >
              {weeks.flatMap((week, weekIndex) =>
                week.map((date) => {
                  const key = toDateKey(date);
                  const count = activityMap.get(key) || 0;
                  const level =
                    count >= 4 ? 4 : count;
                  const isToday =
                    key === toDateKey(today);
                  const isFuture = date > today;
                  const isBeforeRange =
                    date < firstDate;
                  const isSelected =
                    selectedDate &&
                    key === toDateKey(selectedDate);

                  const levelClasses = [
                    'bg-slate-200 dark:bg-slate-800',
                    'bg-emerald-200 dark:bg-emerald-950',
                    'bg-emerald-300 dark:bg-emerald-800',
                    'bg-emerald-400 dark:bg-emerald-600',
                    'bg-emerald-500 dark:bg-emerald-500',
                  ];

                  return (
                    <button
                      key={`${weekIndex}-${key}`}
                      type="button"
                      disabled={isFuture || isBeforeRange}
                      onClick={() => {
                        if (!isFuture && !isBeforeRange) {
                          setSelectedDate(date);
                        }
                      }}
                      title={
                        isFuture || isBeforeRange
                          ? ''
                          : `${formatDate(date)} · ${count} test${count === 1 ? '' : 's'}`
                      }
                      className={[
                        'aspect-square w-full min-w-0 rounded-[3px] border border-transparent transition-all duration-150',
                        levelClasses[level],
                        isFuture || isBeforeRange
                          ? 'cursor-default opacity-30'
                          : 'cursor-pointer hover:z-10 hover:scale-110 hover:border-indigo-400 hover:shadow-[0_0_0_2px_rgba(99,102,241,0.12)]',
                        isToday
                          ? 'border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.12)]'
                          : '',
                        isSelected
                          ? 'z-10 scale-110 border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.18)]'
                          : '',
                      ].join(' ')}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span>Less</span>

          {[
            'bg-slate-200 dark:bg-slate-800',
            'bg-emerald-200 dark:bg-emerald-950',
            'bg-emerald-300 dark:bg-emerald-800',
            'bg-emerald-400 dark:bg-emerald-600',
            'bg-emerald-500 dark:bg-emerald-500',
          ].map((className, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-[3px] ${className}`}
            />
          ))}

          <span>More</span>
        </div>

        <span>
          {streak?.totalActiveDays || 0} active day
          {(streak?.totalActiveDays || 0) === 1 ? '' : 's'}
        </span>
      </div>

      {selectedDate && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
              Selected
            </p>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(selectedDate)}
            </p>
          </div>

          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {selectedActivity} test
            {selectedActivity === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </div>
  );
}

const DAY_COUNT = 365;

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());