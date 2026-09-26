'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderTree, Library, HelpCircle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { categoriesApi, seriesApi, questionsApi } from '@/services/adminService';

function StatCard({ icon: Icon, label, value, loading, href }) {
  return (
    <Link href={href}>
      <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-2" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Icon size={20} />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

const SHORTCUTS = [
  {
    href: '/admin-dashboard/categories',
    icon: FolderTree,
    title: 'Manage categories',
    description: 'Group test series by exam or subject, and set required translation languages.',
  },
  {
    href: '/admin-dashboard/series',
    icon: Library,
    title: 'Build a test series',
    description: 'Create a series, then add mock tests, sections, and questions to it.',
  },
  {
    href: '/admin-dashboard/questions',
    icon: HelpCircle,
    title: 'Author questions',
    description: 'Add reusable questions with LaTeX, multiple languages, and answer keys.',
  },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ categories: null, series: null, questions: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [categories, seriesResult, questionsResult] = await Promise.all([
          categoriesApi.list().catch(() => []),
          seriesApi.list({ page: 1, limit: 1 }).catch(() => ({ meta: null })),
          questionsApi.list({ page: 1, limit: 1 }).catch(() => ({ meta: null })),
        ]);
        if (cancelled) return;
        setStats({
          categories: categories.length,
          series: seriesResult.meta?.pagination?.total_records ?? 0,
          questions: questionsResult.meta?.pagination?.total_records ?? 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Overview" subtitle="A quick snapshot of your testing platform." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={FolderTree} label="Categories" value={stats.categories} loading={loading} href="/admin-dashboard/categories" />
        <StatCard icon={Library} label="Test series" value={stats.series} loading={loading} href="/admin-dashboard/series" />
        <StatCard icon={HelpCircle} label="Questions" value={stats.questions} loading={loading} href="/admin-dashboard/questions" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Get started</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SHORTCUTS.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
              <CardBody>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                  <s.icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {s.title}
                  <ArrowRight size={14} className="text-slate-400" />
                </h3>
                <p className="text-sm text-slate-500 mt-1">{s.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
