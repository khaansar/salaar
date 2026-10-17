'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Flame } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useGetCalendarAnalyticsQuery } from '../../store/userApi';

/**
 * Welcome banner for logged-in students (top of the home page).
 *
 * Streak data is read exactly like PremiumCalendar:
 *   useGetCalendarAnalyticsQuery({ year, month }, { skip: !user })
 *   -> { activeDays: [dayOfMonth], currentStreak, longestStreak }
 * Same hook, same args, so RTK Query serves both components from one cached request.
 */

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday-first, same as PremiumCalendar
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentBanner() {
  const { user } = useAppSelector((state) => state.auth);

  // Same setup as PremiumCalendar
  const todayDate = useMemo(() => new Date(), []);
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth() + 1; // API is 1-indexed for month

  const { data, isLoading } = useGetCalendarAnalyticsQuery({ year, month }, { skip: !user });

  const activeDays = data?.activeDays || [];
  const currentStreak = data?.currentStreak || 0;
  const longestStreak = data?.longestStreak || 0;

  // Greeting depends on the hour, so set it after mount to avoid a hydration mismatch.
  const [greeting, setGreeting] = useState('Welcome back');
  useEffect(() => setGreeting(getGreeting(new Date().getHours())), []);

  // Current week (Sunday to Saturday), using the same today / checked / missed-dot rules as the calendar.
  const week = useMemo(() => {
    const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    return DAY_LETTERS.map((letter, i) => {
      const date = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate() - startOfToday.getDay() + i);
      // The API returns one month at a time, so days outside the current month have no data.
      const hasData = date.getMonth() === todayDate.getMonth();
      const today = date.getTime() === startOfToday.getTime();
      const checked = hasData && activeDays.includes(date.getDate());
      const isPast = date < startOfToday && !today;
      return { name: DAY_NAMES[i], day: date.getDate(), hasData, today, checked, future: date > startOfToday, dot: hasData && isPast && !checked };
    });
  }, [todayDate, activeDays]);

  if (!user) return null;

  const name = user.firstName || 'there';
  const practicedToday = week.some((d) => d.today && d.checked);
  let message = 'Pick up where you left off, or take a fresh mock test.';
  if (!isLoading && data) {
    if (practicedToday) message = `You've practiced today and you're on a ${currentStreak}-day streak. Keep it going tomorrow.`;
    else if (currentStreak > 0) message = `You're on a ${currentStreak}-day streak. Take a test today to keep it alive.`;
    else message = 'Take a mock test today to start your streak.';
  }

  return (
    <section
      aria-label="Welcome"
      className="relative mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-100/70 dark:border-slate-800 dark:bg-slate-900 dark:bg-none"
    >
      {/* Decoration: rings in light mode, a soft blue glow in dark mode */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-[36px] border-blue-100/70 dark:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 hidden h-80 w-80 rounded-full bg-blue-500/15 blur-3xl dark:block" />

      <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-10">
        {/* Greeting */}
        <div className="lg:col-span-6">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            {greeting}, {name}.
          </h1>
          <p className="mt-3 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tests"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:shadow-none dark:ring-offset-slate-900 dark:hover:bg-blue-500"
            >
              Start a mock test
            </Link>
            <Link
              href="/test-series"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-transparent dark:text-slate-100 dark:ring-offset-slate-900 dark:hover:border-slate-500 dark:hover:bg-white/5"
            >
              Browse test series
            </Link>
          </div>
        </div>

        {/* Streak week: solid blue in light mode, a quiet slate card with blue accents in dark mode */}
        <div className="lg:col-span-6 lg:pl-6">
          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-xl shadow-blue-600/25 dark:border dark:border-slate-700/70 dark:bg-slate-950/50 dark:shadow-none sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 dark:bg-blue-500/15 dark:text-blue-400">
                  <Flame size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xl font-extrabold leading-none">{currentStreak} Day Streak</p>
                  <p className="mt-1 text-xs text-blue-100 dark:text-slate-400">This week</p>
                </div>
              </div>
              <p className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white dark:bg-slate-800 dark:text-slate-300">
                Longest: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
              </p>
            </div>

            <ol className={`mt-6 grid grid-cols-7 gap-1.5 pb-2 sm:gap-2 ${isLoading ? 'opacity-50' : ''}`}>
              {week.map((d, i) => {
                let circle = 'text-white/60 dark:text-slate-500';
                if (d.checked) circle = 'bg-white text-blue-600 dark:bg-blue-500 dark:text-white';
                else if (d.today) circle = 'bg-white/25 ring-2 ring-white text-white font-bold dark:bg-blue-500/15 dark:ring-blue-400 dark:text-blue-300';
                else if (d.future) circle = 'border border-white/25 text-white/50 dark:border-slate-700 dark:text-slate-500';
                else if (d.hasData) circle = 'text-white/90 dark:text-slate-300';

                return (
                  <li key={i} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-blue-100 dark:text-slate-500">{DAY_LETTERS[i]}</span>
                    <div className="relative">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold sm:h-11 sm:w-11 sm:text-sm ${circle}`}
                        aria-label={`${d.name} ${d.day}${d.today ? ', today' : ''}${d.checked ? ', practiced' : d.dot ? ', missed' : ''}`}
                      >
                        {d.checked ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : d.day}
                      </span>
                      {d.dot && (
                        <span aria-hidden="true" className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose-300 dark:bg-rose-500" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}