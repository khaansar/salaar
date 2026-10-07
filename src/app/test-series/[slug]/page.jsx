import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, CheckCircle2, ArrowRight, FileText, Lightbulb, BarChart2,
  Monitor, BookOpen, ShieldCheck, Layers, Target, Trophy,
} from 'lucide-react';

import StudentShell from '../../../components/student/StudentShell';
import SeriesTestsTable from '../../../features/test-series/SeriesTestsTable';
import Testimonials from '../../../features/home/Testimonials';
import HomeFaq from '../../../features/home/HomeFaq';
import { testService } from '../../../services/testService';
import { catalogService } from '../../../services/catalogService';
import { APP_NAME } from '../../../constants/brand';

const card = 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900';

function formatPrice(value) {
  if (!value || Number(value) === 0) return 'Free';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function Chip({ icon: Icon, tone, label, className }) {
  return (
    <span className={`absolute hidden items-center gap-2 rounded-lg border border-white bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-800 shadow-md shadow-indigo-500/10 md:flex ${className}`}>
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tone}`}><Icon size={13} /></span>
      {label}
    </span>
  );
}

const INCLUDED = [
  'Detailed Step-by-step Solutions',
  'Topic-wise and Section-wise Analysis',
  'Answer Key with Explanations',
  'All India Rank & Performance Analysis',
  'Mobile & Desktop Access',
]; // TODO: confirm these feature claims or load from series data

const WHY = [
  { icon: Monitor, title: 'Real Exam Experience', text: 'Tests as per latest pattern', tone: 'bg-brand-50 text-brand-600' },
  { icon: Lightbulb, title: 'Detailed Solutions', text: 'Step-by-step explanations', tone: 'bg-rose-50 text-rose-500' },
  { icon: BarChart2, title: 'Performance Analytics', text: 'Identify weak areas', tone: 'bg-emerald-50 text-emerald-600' },
  { icon: BookOpen, title: 'All Subjects Covered', text: 'Complete syllabus coverage', tone: 'bg-brand-50 text-brand-600' },
  { icon: Target, title: 'Track Progress', text: 'Monitor how you improve', tone: 'bg-amber-50 text-amber-500' },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const series = await testService.getSeriesBySlug(slug);

    return {
      title: `${series.title} | ${APP_NAME}`,
      description: `Practice mock tests from ${series.title}.`,
    };
  } catch {
    return { title: `Test Series | ${APP_NAME}` };
  }
}

export default async function TestSeriesPage({ params }) {
  const { slug } = await params;

  let series;

  try {
    series = await testService.getSeriesBySlug(slug);
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!series) notFound();

  const mockTests = Array.isArray(series.mockTests) ? series.mockTests : [];
  const isFree = !series.basePrice || Number(series.basePrice) === 0;

  const popular = await catalogService.getPopularSeries().catch(() => []);
  const similar = (Array.isArray(popular) ? popular : []).filter((s) => s.slug !== slug).slice(0, 4);

  return (
    <StudentShell>
      <div className="pb-12">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight size={12} />
          <Link href="/test-series" className="hover:text-brand-600">Test Series</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-slate-700">{series.title}</span>
        </nav>

        <section className="relative mb-4 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-[#f6f4ff] to-[#ebe7ff] dark:border-white/5 dark:from-slate-900 dark:via-indigo-950/40 dark:to-purple-950/40">
          <div className="grid items-center gap-4 px-6 py-8 sm:px-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-600">
                {series.categoryName || 'Test Series'}
              </span>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {series.title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                {series.description || `A collection of high-quality mock tests from ${series.title}, with detailed solutions and in-depth performance analysis.`}
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600"><FileText size={15} /></span><b className="text-slate-900">{mockTests.length} Mock Tests</b></li>
                <li className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600"><Lightbulb size={15} /></span>Detailed Solutions</li>
                <li className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600"><BarChart2 size={15} /></span>Performance Analysis</li>
              </ul>
            </div>
            <div className="relative h-56 sm:h-64">
              <div className="absolute inset-0 md:inset-x-20">
                <Image src="/images/home/hero-student.svg" alt="" fill priority unoptimized className="object-contain" />
              </div>
              <Chip icon={Monitor} tone="bg-brand-50 text-brand-600" label="Real Exam Experience" className="left-0 top-2" />
              <Chip icon={Lightbulb} tone="bg-amber-100 text-amber-500" label="Detailed Solutions" className="left-0 top-28" />
              <Chip icon={BookOpen} tone="bg-blue-100 text-blue-600" label="All Subjects Covered" className="right-0 top-2" />
              <Chip icon={BarChart2} tone="bg-emerald-100 text-emerald-600" label="Performance Analytics" className="right-0 top-28" />
            </div>
          </div>
        </section>

        <div className="mb-5 flex gap-6 overflow-x-auto rounded-xl border border-slate-200/80 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
          {[['Overview', '#overview'], [`Tests (${mockTests.length})`, '#tests'], ['FAQs', '#faqs'], ['Reviews', '#reviews']].map(([label, href], i) => (
            <a key={label} href={href} className={`-mb-px whitespace-nowrap border-b-2 py-3.5 text-xs font-semibold ${i === 0 ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {label}
            </a>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <section id="overview" className={card}>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><FileText size={20} className="text-brand-600" /> About This Series</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {series.description || `${series.title} is designed to help you practice effectively and score higher. Each test comes with detailed solutions, performance analysis and topic-wise insights to help you identify your strengths and weaknesses.`}
              </p>
              <div className="mt-5 rounded-xl bg-brand-50/60 p-4 dark:bg-slate-800/40">
                <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">What&apos;s Included?</h3>
                <ul className="grid gap-2.5 text-xs text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                  <li className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-emerald-500" />{mockTests.length} Mock Tests</li>
                  {INCLUDED.map((x) => (
                    <li key={x} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-emerald-500" />{x}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="tests" className={card}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Layers size={20} className="text-brand-600" /> Tests in This Series ({mockTests.length})</h2>
              <SeriesTestsTable tests={mockTests} />
            </section>
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-20">
            <div className={card}>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{formatPrice(series.basePrice)}</p>
              <p className="mt-1 text-xs text-slate-500">{isFree ? 'Free access' : 'One-time payment'} • Full access to {mockTests.length} tests</p>
              <Link href={isFree ? '#tests' : '/pricing'} className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                {isFree ? 'Start Practicing' : 'Buy Now & Start Practicing'} <ArrowRight size={15} />
              </Link>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                {[`Full access to all ${mockTests.length} tests`, 'Detailed solutions & analytics', 'Access on web, mobile and tablet', 'No hidden charges'].map((x) => (
                  <li key={x} className="flex items-center gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-500" />{x}</li>
                ))}
              </ul>
            </div>

            {similar.length > 0 && (
              <div className={card}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Similar Test Series</h2>
                  <Link href="/test-series" className="flex items-center gap-1 text-[11px] font-semibold text-brand-600">View All <ArrowRight size={12} /></Link>
                </div>
                <ul className="space-y-2">
                  {similar.map((s) => (
                    <li key={s.id}>
                      <Link href={`/test-series/${s.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><FileText size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{s.title}</span>
                          {s.testCount != null && <span className="text-[11px] text-slate-500">{s.testCount} Tests</span>}
                        </span>
                        <ArrowRight size={14} className="text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <section className={`${card} mt-5`}>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><ShieldCheck size={20} className="text-brand-600" /> Why Choose {APP_NAME}?</h2>
          <p className="mt-1 text-xs text-slate-500">Everything you need to crack your exam, in one place.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {WHY.map((w) => (
              <div key={w.title} className="flex items-start gap-2.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${w.tone}`}><w.icon size={18} /></span>
                <div><h3 className="text-xs font-bold text-slate-900 dark:text-white">{w.title}</h3><p className="text-[11px] leading-4 text-slate-500">{w.text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <div id="reviews" className="mt-5"><Testimonials /></div>
        <div id="faqs"><HomeFaq /></div>
      </div>
    </StudentShell>
  );
}
