'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Library,
  HelpCircle,
  Lock,
  ArrowRight,
  FileText,
  Languages,
  Plus,
  Activity,
  Inbox,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { DonutChart, DonutLegend } from '@/components/common/DonutChart';
import { StatCard } from '@/components/admin/StatCard';
import { useAppSelector } from '@/hooks/useAppSelector';
import { categoriesApi, seriesApi, questionsApi } from '@/services/adminService';
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/enums';
import { colorForKey } from '@/lib/colorHash';

const TYPE_COLORS = {
  MCQ: '#4F46E5',
  MULTI_CORRECT: '#8B5CF6',
  NUMERICAL: '#06B6D4',
  SUBJECTIVE: '#94A3B8',
};

const DIFFICULTY_COLORS = {
  EASY: '#10B981',
  MEDIUM: '#F59E0B',
  HARD: '#F43F5E',
};

function greeting(now) {
  if (!now) return 'Welcome';

  const hour = now.getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';

  return 'Good evening';
}

const QUICK_CREATE = [
  {
    href: '/admin-dashboard/categories/new',
    icon: FolderTree,
    label: 'Exam category',
    description: 'Group series by exam',
    tone:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  {
    href: '/admin-dashboard/series/new',
    icon: Library,
    label: 'Test series',
    description: 'Bundle mock tests',
    tone:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    href: '/admin-dashboard/series',
    icon: FileText,
    label: 'Mock test',
    description: 'Pick a series first',
    tone:
      'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    href: '/admin-dashboard/questions/new',
    icon: HelpCircle,
    label: 'Question',
    description: 'Add to the bank',
    tone:
      'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  },
];

function ListSkeleton({ rows = 4 }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardEmpty({ icon: Icon = Inbox, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={18} />
      </span>
      <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <CardHeader className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </CardHeader>
  );
}

function ViewAll({ href }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      View all <ArrowRight size={13} />
    </Link>
  );
}

// True only after hydration. Date/time text depends on the browser's locale
// and clock, so it must not be rendered on the server.
const subscribeNoop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

// Fetches the total_records count for a filtered list without pulling any
// rows, by asking for limit=1 and reading the pagination meta.
async function countWith(fetcher, params) {
  try {
    const { meta } = await fetcher({
      ...params,
      page: 1,
      limit: 1,
    });

    return meta?.pagination?.total_records ?? 0;
  } catch {
    return 0;
  }
}

export default function AdminOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categorySeriesCounts, setCategorySeriesCounts] = useState({});

  const [counts, setCounts] = useState({
    categories: 0,
    series: 0,
    questions: 0,
    lockedQuestions: 0,
  });

  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [difficultyBreakdown, setDifficultyBreakdown] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentSeries, setRecentSeries] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const [
          categoriesList,
          seriesCount,
          questionsCount,
          lockedCount,
          typeCounts,
          difficultyCounts,
          recentQ,
          recentS,
        ] = await Promise.all([
          categoriesApi.list().catch(() => []),

          countWith(seriesApi.list, {}),

          countWith(questionsApi.list, {}),

          countWith(questionsApi.list, {
            isLocked: true,
          }),

          Promise.all(
            QUESTION_TYPE_OPTIONS.map((o) =>
              countWith(questionsApi.list, {
                type: o.value,
              })
            )
          ),

          Promise.all(
            DIFFICULTY_OPTIONS.map((o) =>
              countWith(questionsApi.list, {
                difficulty: o.value,
              })
            )
          ),

          questionsApi
            .list({
              page: 1,
              limit: 5,
            })
            .catch(() => ({
              data: [],
            })),

          seriesApi
            .list({
              page: 1,
              limit: 5,
            })
            .catch(() => ({
              data: [],
            })),
        ]);

        if (cancelled) return;

        setCategories(categoriesList);

        setCounts({
          categories: categoriesList.length,
          series: seriesCount,
          questions: questionsCount,
          lockedQuestions: lockedCount,
        });

        setTypeBreakdown(
          QUESTION_TYPE_OPTIONS.map((o, i) => ({
            label: o.label,
            value: typeCounts[i],
            color: TYPE_COLORS[o.value],
          }))
        );

        setDifficultyBreakdown(
          DIFFICULTY_OPTIONS.map((o, i) => ({
            label: o.label,
            value: difficultyCounts[i],
            color: DIFFICULTY_COLORS[o.value],
          }))
        );

        setRecentQuestions(
          [...(recentQ.data || [])]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            )
            .slice(0, 5)
        );

        setRecentSeries(
          [...(recentS.data || [])]
            .sort(
              (a, b) =>
                new Date(b.updatedAt || 0) -
                new Date(a.updatedAt || 0)
            )
            .slice(0, 5)
        );

        // Bound the number of extra calls: only look up a per-category
        // series count for the handful of categories we actually display.
        const shown = categoriesList.slice(0, 5);

        const pairs = await Promise.all(
          shown.map(async (c) => [
            c.id,
            await countWith(seriesApi.list, {
              categoryId: c.id,
            }),
          ])
        );

        if (!cancelled) {
          setCategorySeriesCounts(Object.fromEntries(pairs));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalQuestionsForDonut = typeBreakdown.reduce(
    (sum, s) => sum + s.value,
    0
  );

  const firstName = user?.firstName || 'Admin';

  const recentActivity = useMemo(() => {
    const qItems = recentQuestions.map((q) => ({
      key: `q-${q.id}`,
      icon: HelpCircle,
      tone:
        'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
      title: q.shortText || 'New question added',
      subtitle: `${q.questionType} · ${q.difficulty}`,
      date: q.createdAt,
      href: `/admin-dashboard/questions/${q.id}`,
    }));

    const sItems = recentSeries.map((s) => ({
      key: `s-${s.id}`,
      icon: Library,
      tone:
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
      title: s.title,
      subtitle: `${s.categoryName || 'Uncategorized'} · ${s.status}`,
      date: s.updatedAt,
      href: `/admin-dashboard/series/${s.id}`,
    }));

    return [...qItems, ...sItems]
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      )
      .slice(0, 6);
  }, [recentQuestions, recentSeries]);


  const isClient = useIsClient();
  const now = isClient ? new Date() : null;
  const today = now
    ? now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="min-h-4 text-xs font-medium text-slate-500 dark:text-slate-400">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting(now)}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your exams, mock tests, sections and questions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin-dashboard/questions"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <HelpCircle size={16} /> Question bank
          </Link>
          <Link
            href="/admin-dashboard/series/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus size={16} /> New test series
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FolderTree}
          label="Exam Categories"
          value={counts.categories ?? 0}
          loading={loading}
          href="/admin-dashboard/categories"
          tone="indigo"
          hint="Exams and programs"
        />
        <StatCard
          icon={Library}
          label="Test Series"
          value={counts.series ?? 0}
          loading={loading}
          href="/admin-dashboard/series"
          tone="emerald"
          hint="Across all categories"
        />
        <StatCard
          icon={HelpCircle}
          label="Questions"
          value={counts.questions ?? 0}
          loading={loading}
          href="/admin-dashboard/questions"
          tone="amber"
          hint="In the question bank"
        />
        <StatCard
          icon={Lock}
          label="Locked Questions"
          value={counts.lockedQuestions ?? 0}
          loading={loading}
          href="/admin-dashboard/questions"
          tone="rose"
          hint="Marked as locked"
        />
      </div>

      {/* Quick create */}
      <section aria-labelledby="quick-create-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="quick-create-heading" className="text-sm font-semibold text-slate-900 dark:text-white">
            Quick create
          </h2>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Add new content to your platform</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_CREATE.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                <item.icon size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.label}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-500">
                <Plus size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: recent activity + exam categories */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle
              title="Recent activity"
              subtitle="Latest questions and test series updates."
            />

            {loading ? (
              <ListSkeleton rows={5} />
            ) : recentActivity.length === 0 ? (
              <CardEmpty icon={Activity}>No activity yet.</CardEmpty>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                        <item.icon size={16} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                        {item.date ? new Date(item.date).toLocaleDateString() : ''}
                      </span>
                      <ArrowRight
                        size={14}
                        className="hidden shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600 sm:block"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle
              title="Exam categories"
              subtitle="Your most recent categories at a glance."
              action={<ViewAll href="/admin-dashboard/categories" />}
            />

            {loading ? (
              <ListSkeleton rows={4} />
            ) : categories.length === 0 ? (
              <CardEmpty icon={FolderTree}>
                No categories yet.{' '}
                <Link
                  href="/admin-dashboard/categories/new"
                  className="font-medium text-indigo-600 dark:text-indigo-400"
                >
                  Create one
                </Link>
                .
              </CardEmpty>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.slice(0, 5).map((c) => {
                  const color = colorForKey(c.id);

                  return (
                    <li key={c.id}>
                      <Link
                        href="/admin-dashboard/categories"
                        className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${color.bg} ${color.text}`}
                          >
                            {c.name?.[0]?.toUpperCase() || '?'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                            {c.description && (
                              <p className="max-w-md truncate text-xs text-slate-500 dark:text-slate-400">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Library size={11} />
                            {categorySeriesCounts[c.id] ?? '—'} series
                          </span>

                          {(c.requiredLanguages || []).length > 0 && (
                            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                              <Languages size={11} />
                              {c.requiredLanguages.length}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Right: content health */}
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Difficulty overview" subtitle="Spread of questions by difficulty." />

            <CardBody className="p-5">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : (
                <>
                  <div className="mb-5 flex justify-center">
                    <DonutChart
                      segments={difficultyBreakdown}
                      centerValue={totalQuestionsForDonut}
                      centerLabel="Questions"
                    />
                  </div>

                  <DonutLegend segments={difficultyBreakdown} />
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <SectionTitle title="Question types" subtitle="How your bank is composed." />

            <CardBody className="space-y-4 p-5">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3.5 w-1/2" />
                      <Skeleton className="h-1.5 w-full" />
                    </div>
                  ))
                : typeBreakdown.map((t) => {
                    const pct =
                      totalQuestionsForDonut > 0
                        ? Math.round((t.value / totalQuestionsForDonut) * 100)
                        : 0;

                    return (
                      <div key={t.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="inline-flex min-w-0 items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                            <span className="truncate">{t.label}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-900 dark:text-white">{t.value}</span> · {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{ width: `${pct}%`, backgroundColor: t.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
