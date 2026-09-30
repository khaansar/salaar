'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Library,
  HelpCircle,
  Lock,
  ArrowRight,
  FileText,
  Languages,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { DonutChart, DonutLegend } from '@/components/common/DonutChart';
import { useAppSelector } from '@/hooks/useAppSelector';
import { categoriesApi, seriesApi, questionsApi } from '@/services/adminService';
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/enums';

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

function greeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';

  return 'Good evening';
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  href,
  tone = 'indigo',
}) {
  const toneClasses = {
    indigo:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
    emerald:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber:
      'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    rose:
      'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  };

  return (
    <Link href={href}>
      <Card className="hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer h-full">
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>

            {loading ? (
              <Skeleton className="h-7 w-16 mt-2" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {value ?? 0}
              </p>
            )}
          </div>

          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${toneClasses[tone]}`}
          >
            <Icon size={20} />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

const QUICK_CREATE = [
  {
    href: '/admin-dashboard/categories/new',
    icon: FolderTree,
    label: 'Create Exam Category',
    tone:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  {
    href: '/admin-dashboard/series/new',
    icon: Library,
    label: 'Create Test Series',
    tone:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    href: '/admin-dashboard/series',
    icon: FileText,
    label: 'Create Mock Test',
    tone:
      'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    href: '/admin-dashboard/questions/new',
    icon: HelpCircle,
    label: 'Add Question',
    tone:
      'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  },
];

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {greeting()}, {firstName} 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your exams, mock tests, sections and questions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FolderTree}
          label="Exam Categories"
          value={counts.categories}
          loading={loading}
          href="/admin-dashboard/categories"
          tone="indigo"
        />

        <StatCard
          icon={Library}
          label="Test Series"
          value={counts.series}
          loading={loading}
          href="/admin-dashboard/series"
          tone="emerald"
        />

        <StatCard
          icon={HelpCircle}
          label="Questions"
          value={counts.questions}
          loading={loading}
          href="/admin-dashboard/questions"
          tone="amber"
        />

        <StatCard
          icon={Lock}
          label="Locked Questions"
          value={counts.lockedQuestions}
          loading={loading}
          href="/admin-dashboard/questions"
          tone="rose"
        />
      </div>

      {/* Quick create */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Quick Create
            </h2>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Add new content to your platform
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_CREATE.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.tone}`}
                >
                  <item.icon size={20} />
                </div>

                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  {item.label}

                  <ArrowRight
                    size={13}
                    className="text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Exam categories + recent activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Categories */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Exam Categories
              </h2>

              <Link
                href="/admin-dashboard/categories"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                View all
              </Link>
            </CardHeader>

            {loading ? (
              <CardBody className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-full"
                  />
                ))}
              </CardBody>
            ) : categories.length === 0 ? (
              <CardBody className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                No categories yet.{' '}
                <Link
                  href="/admin-dashboard/categories/new"
                  className="text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  Create one
                </Link>
                .
              </CardBody>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href="/admin-dashboard/categories"
                    className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {c.name}
                      </p>

                      {c.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        <Library size={12} />
                        {categorySeriesCounts[c.id] ?? '—'} series
                      </span>

                      {(c.requiredLanguages || []).length > 0 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                          <Languages size={12} />
                          {c.requiredLanguages.length}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Latest questions and test series updates.
              </p>
            </CardHeader>

            {loading ? (
              <CardBody className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-full"
                  />
                ))}
              </CardBody>
            ) : recentActivity.length === 0 ? (
              <CardBody className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                No activity yet.
              </CardBody>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.tone}`}
                    >
                      <item.icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                        {item.title}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>

                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: donut + question types */}
        <div className="space-y-6">
          {/* Difficulty Overview */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Difficulty Overview
              </h2>
            </CardHeader>

            <CardBody>
              {loading ? (
                <div className="flex justify-center py-6">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-5">
                    <DonutChart
                      segments={difficultyBreakdown}
                      centerValue={totalQuestionsForDonut}
                      centerLabel="Questions"
                    />
                  </div>

                  <DonutLegend
                    segments={difficultyBreakdown}
                  />
                </>
              )}
            </CardBody>
          </Card>

          {/* Question Types */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Question Types
              </h2>
            </CardHeader>

            <CardBody className="grid grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-20 w-full"
                    />
                  ))
                : typeBreakdown.map((t) => {
                    const pct =
                      totalQuestionsForDonut > 0
                        ? Math.round(
                            (t.value / totalQuestionsForDonut) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={t.label}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                      >
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                          {t.label}
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {t.value}
                        </p>

                        <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: t.color,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                          {pct}%
                        </p>
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
