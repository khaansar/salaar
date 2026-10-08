'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  Clock3,
  Medal,
  Printer,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';

import { useAppSelector } from '../../../../hooks/useAppSelector';
import { useGetAttemptReportQuery } from '../../../../store/reportApi';
import { siteConfig } from '../../../../config/site';
import BrandLogo from '@/components/common/BrandLogo';

/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

const formatNumber = (value, digits = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return number.toFixed(digits);
};

const formatDuration = (seconds) => {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return '—';

  const totalSeconds = Math.round(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const getScorePercentage = (summary) => {
  const score = Number(summary?.totalScore);
  const maxScore = Number(summary?.maxScore);

  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
    return null;
  }

  return (score / maxScore) * 100;
};

const getGradeClassification = (percentage) => {
  if (percentage === null || percentage === undefined) return { grade: '—', label: 'Evaluated', badgeBg: 'bg-slate-700', textColor: 'text-slate-300' };
  if (percentage >= 90) return { grade: 'A+', label: 'Outstanding / Distinction', badgeBg: 'bg-emerald-600', textColor: 'text-emerald-600' };
  if (percentage >= 75) return { grade: 'A', label: 'First Class Distinction', badgeBg: 'bg-indigo-600', textColor: 'text-indigo-600' };
  if (percentage >= 60) return { grade: 'B', label: 'First Class', badgeBg: 'bg-blue-600', textColor: 'text-blue-600' };
  if (percentage >= 50) return { grade: 'C', label: 'Second Class', badgeBg: 'bg-amber-600', textColor: 'text-amber-600' };
  if (percentage >= 35) return { grade: 'D', label: 'Pass', badgeBg: 'bg-orange-600', textColor: 'text-orange-600' };
  return { grade: 'F', label: 'Needs Improvement', badgeBg: 'bg-rose-600', textColor: 'text-rose-600' };
};

const getUserName = (user) => {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || user?.email || 'Student';
};

function formatLabel(value) {
  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function AttemptResultPage() {
  const params = useParams();
  const attemptId = params?.id;

  const { user } = useAppSelector((state) => state.auth);

  const {
    data: report,
    isLoading,
    isFetching,
    error,
  } = useGetAttemptReportQuery(attemptId, {
    skip: !attemptId,
  });

  if (isLoading || isFetching) {
    return <ReportSkeleton />;
  }

  if (error || !report) {
    return <ReportError />;
  }

  return (
    <ReportContent
      report={report}
      userName={getUserName(user)}
      userEmail={user?.email}
      attemptId={attemptId}
    />
  );
}

function ReportContent({ report, userName, userEmail, attemptId }) {
  const summary = report?.summary;
  const sections = Array.isArray(report?.sectionBreakdown) ? report.sectionBreakdown : [];
  const scorePercentage = getScorePercentage(summary);
  const gradeInfo = getGradeClassification(scorePercentage);

  // Question counts across sections
  const totalQuestions = sections.length
    ? sections.reduce((acc, sec) => acc + Number(sec?.totalQuestions || 0), 0)
    : null;
  const totalCorrect = sections.reduce((acc, sec) => acc + Number(sec?.correct || 0), 0);
  const totalIncorrect = sections.reduce((acc, sec) => acc + Number(sec?.incorrect || 0), 0);
  const totalUnattempted = sections.reduce((acc, sec) => acc + Number(sec?.unattempted || 0), 0);

  return (
    <>
      {/* =====================================================
          SCREEN REPORT CARD (SCREEN VIEW)
         ===================================================== */}
      <div className="report-screen mx-auto w-full max-w-[1360px] space-y-5 px-4 py-5 sm:px-8 print:hidden">
        {/* Navigation & Action Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={15} />
            <span>Back to History</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
          >
            <Printer size={14} />
            <span>Print Official Report</span>
          </button>
        </div>

        {/* Wide Report Card Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {/* Header Ribbon */}
          <div className="relative border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-6 sm:px-8 lg:px-10 text-white dark:border-slate-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300 border border-indigo-400/30">
                    <ShieldCheck size={12} />
                    Verified Assessment Record
                  </span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                  PERFORMANCE REPORT CARD
                </h1>
                <p className="text-xs text-indigo-200/80">
                  Official Statement of Academic Evaluation & Competency Transcript
                </p>
              </div>

              {/* Distinction Grade Seal */}
              <div className="flex shrink-0 items-center gap-3.5 rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md">
                <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${gradeInfo.badgeBg} text-white shadow-lg`}>
                  <span className="text-2xl sm:text-3xl font-black tracking-wider">{gradeInfo.grade}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    Grade Status
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-white">{gradeInfo.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Identity Metadata Grid */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4.5 sm:px-8 lg:px-10 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate Name</p>
                <p className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User size={14} className="text-indigo-500" />
                  {userName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate ID / Email</p>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {userEmail || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assessment Reference ID</p>
                <p className="mt-0.5 text-xs sm:text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                  #{String(attemptId || 'REPORT').slice(-8).toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation Date</p>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" />
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics & Breakdown Body */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            {/* 4-Column Metric Grid */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
              <MetricBox
                icon={Award}
                label="Total Score"
                value={`${formatNumber(summary?.totalScore)} / ${formatNumber(summary?.maxScore)}`}
                subtext={scorePercentage !== null ? `${formatNumber(scorePercentage, 1)}% Overall` : '—'}
                color="indigo"
              />

              <MetricBox
                icon={Target}
                label="Accuracy Rate"
                value={
                  summary?.accuracy !== null && summary?.accuracy !== undefined
                    ? `${formatNumber(summary.accuracy)}%`
                    : '—'
                }
                subtext="Precision Ratio"
                color="emerald"
              />

              <MetricBox
                icon={TrendingUp}
                label="Percentile Rank"
                value={
                  summary?.percentile !== null && summary?.percentile !== undefined
                    ? `${formatNumber(summary.percentile, 1)}%ile`
                    : '—'
                }
                subtext={summary?.rank ? `Class Rank #${summary.rank}` : 'Competitive Standing'}
                color="blue"
              />

              <MetricBox
                icon={Clock3}
                label="Time Elapsed"
                value={formatDuration(summary?.timeTakenSeconds)}
                subtext="Duration Completed"
                color="purple"
              />
            </div>

            {/* Overall Progress Bars */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    OVERALL SCORE ACHIEVEMENT
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Calculated score performance percentage relative to total maximum marks.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {scorePercentage !== null ? `${formatNumber(scorePercentage, 1)}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Score Progress Bar */}
              <div className="mt-3 h-3.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(scorePercentage || 0, 0), 100)}%` }}
                />
              </div>

              {/* Question Breakdown Visualizer */}
              {totalQuestions ? (
                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    <span>Question Breakdown ({totalQuestions} Total)</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Correct ({totalCorrect})
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" /> Incorrect ({totalIncorrect})
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" /> Skipped ({totalUnattempted})
                      </span>
                    </div>
                  </div>

                  <div className="flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      style={{ width: `${(totalCorrect / totalQuestions) * 100}%` }}
                      className="bg-emerald-500 transition-all"
                      title={`Correct: ${totalCorrect}`}
                    />
                    <div
                      style={{ width: `${(totalIncorrect / totalQuestions) * 100}%` }}
                      className="bg-rose-500 transition-all"
                      title={`Incorrect: ${totalIncorrect}`}
                    />
                    <div
                      style={{ width: `${(totalUnattempted / totalQuestions) * 100}%` }}
                      className="bg-slate-400 dark:bg-slate-600 transition-all"
                      title={`Skipped: ${totalUnattempted}`}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Section Performance Table */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-500" />
                    Sectional Performance Breakdown
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500">Detailed transcript per subject domain</p>
                </div>
              </div>

              {sections.length ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                        <th className="px-5 py-3">Subject / Section</th>
                        <th className="px-4 py-3 text-center">Accuracy Progress</th>
                        <th className="px-4 py-3 text-right">Correct</th>
                        <th className="px-4 py-3 text-right">Incorrect</th>
                        <th className="px-4 py-3 text-right">Skipped</th>
                        <th className="px-5 py-3 text-right">Time Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                      {sections.map((sec, idx) => {
                        const acc = Number(sec?.accuracy);
                        const hasAcc = Number.isFinite(acc);
                        return (
                          <tr
                            key={sec?.sectionId || idx}
                            className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                          >
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-slate-900 dark:text-white">
                                {sec?.sectionName || `Section ${idx + 1}`}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {sec?.totalQuestions ?? '—'} Questions Total
                              </p>
                            </td>

                            <td className="px-4 py-3.5 text-center min-w-[160px]">
                              <div className="flex items-center justify-center gap-2.5">
                                <span className="w-10 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                  {hasAcc ? `${formatNumber(acc)}%` : '—'}
                                </span>
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                                    style={{ width: `${Math.min(Math.max(acc || 0, 0), 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              {sec?.correct ?? '—'}
                            </td>

                            <td className="px-4 py-3.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                              {sec?.incorrect ?? '—'}
                            </td>

                            <td className="px-4 py-3.5 text-right font-medium text-slate-400">
                              {sec?.unattempted ?? '—'}
                            </td>

                            <td className="px-5 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                              {formatDuration(sec?.timeSpentSeconds)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-950">
                  No sectional breakdown data recorded for this attempt.
                </div>
              )}
            </div>

            {/* Peer Comparison */}
            {report?.peerComparison && (
              <ScreenPeerComparison comparison={report?.peerComparison} />
            )}

            {/* Assessment Remarks */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 rounded-lg bg-indigo-600 p-2 text-white dark:bg-indigo-500">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                    Official Evaluator Assessment Remarks
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                    {scorePercentage >= 85
                      ? 'Exceptional mastery demonstrated across subject domains. Speed and accuracy reflect top-tier subject comprehension.'
                      : scorePercentage >= 70
                      ? 'Strong performant execution. Recommended focus on targeted weak sections to elevate overall accuracy to distinction level.'
                      : scorePercentage >= 50
                      ? 'Satisfactory performance score. Review missed concept areas and refine time allocation during practice sessions.'
                      : 'Additional practice recommended. Focus on core section fundamentals and step-by-step revision.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row text-[10px] sm:text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-widest text-slate-500">
                {siteConfig?.name || 'Academic Portal'} • Official Performance Record
              </span>
              <span>Issued automatically by Examination Controller Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PREDOMINANTLY WHITE SINGLE-PAGE PRINT REPORT CARD
         ===================================================== */}
      <PrintReportCard
        userName={userName}
        userEmail={userEmail}
        attemptId={attemptId}
        summary={summary}
        sections={sections}
        scorePercentage={scorePercentage}
        gradeInfo={gradeInfo}
        totalQuestions={totalQuestions}
        totalCorrect={totalCorrect}
        totalIncorrect={totalIncorrect}
        totalUnattempted={totalUnattempted}
      />
    </>
  );
}

/* =========================================================
   UI SUB-COMPONENTS
   ========================================================= */

function MetricBox({ icon: Icon, label, value, subtext, color = 'indigo' }) {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
    purple: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorMap[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
        {value}
      </p>
      {subtext && <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-slate-400">{subtext}</p>}
    </div>
  );
}

function ScreenPeerComparison({ comparison }) {
  if (!comparison) return null;

  const entries = Object.entries(comparison).filter(
    ([, value]) => value !== null && value !== undefined && typeof value !== 'object'
  );

  if (!entries.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-3.5">
        <Medal size={16} className="text-indigo-500" />
        Peer Cohort Benchmarking
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {formatLabel(key)}
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   STRICT SINGLE-PAGE PRINT REPORT CARD (SUBTLE COLOR / WHITE CANVAS)
   ========================================================= */

function PrintReportCard({
  userName,
  userEmail,
  attemptId,
  summary,
  sections,
  scorePercentage,
  gradeInfo,
  totalQuestions,
  totalCorrect,
  totalIncorrect,
  totalUnattempted,
}) {
  return (
    <div className="report-print hidden print:block bg-white text-slate-900 font-sans">
      {/* Force Print CSS Dimensions */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Strict 1-Page Box (281mm Limit) - Clean White Base with Accent Borders */}
      <div className="w-[194mm] h-[281mm] mx-auto flex flex-col justify-between border border-slate-300 rounded-xl overflow-hidden text-xs box-border bg-white">
        <div>
          {/* Crisp White Header with Indigo Top Accent Line */}
          <div className="bg-white px-5 py-4 flex items-center justify-between border-b-2 border-indigo-600">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} className="text-indigo-600" /> Official Academic Transcript
                </span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                PERFORMANCE REPORT CARD
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Verified Examination Statement & Competency Transcript
              </p>
            </div>

            <div className="flex items-center gap-3">
              <BrandLogo href={null} size="lg" showIcon showText />
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Candidate Name</span>
                <span className="font-bold text-slate-900 text-xs truncate block">{userName}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Candidate ID / Email</span>
                <span className="font-medium text-slate-700 text-xs truncate block">{userEmail || '—'}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Attempt Reference ID</span>
                <span className="font-mono font-bold text-indigo-600 text-xs">#{String(attemptId || 'REPORT').slice(-8).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Evaluation Date</span>
                <span className="font-medium text-slate-700 text-xs">
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Score Summary Tiles - Crisp White Cards with Subtle Colored Borders */}
            <div className="flex items-stretch gap-3">
              <div className="grid grid-cols-4 gap-2.5 flex-1">
                <div className="bg-white border border-indigo-200 rounded-lg p-2.5 text-center">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 block">Total Score</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">
                    {formatNumber(summary?.totalScore)}
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold block">/ {formatNumber(summary?.maxScore)} Marks</span>
                </div>

                <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-center">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 block">Accuracy Rate</span>
                  <span className="text-base font-black text-emerald-600 block mt-0.5">
                    {summary?.accuracy !== null && summary?.accuracy !== undefined ? `${formatNumber(summary.accuracy)}%` : '—'}
                  </span>
                  <span className="text-[8px] text-slate-400 block">Precision Ratio</span>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-2.5 text-center">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-blue-600 block">Percentile</span>
                  <span className="text-base font-black text-blue-600 block mt-0.5">
                    {summary?.percentile !== null && summary?.percentile !== undefined ? `${formatNumber(summary.percentile, 1)}%` : '—'}
                  </span>
                  <span className="text-[8px] text-slate-400 block">Class Standing</span>
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-2.5 text-center">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-purple-600 block">Time Elapsed</span>
                  <span className="text-base font-black text-purple-600 block mt-0.5">
                    {formatDuration(summary?.timeTakenSeconds)}
                  </span>
                  <span className="text-[8px] text-slate-400 block">Duration Completed</span>
                </div>
              </div>

              {/* Clean Grade Box */}
              <div className="w-40 bg-white rounded-lg p-2.5 flex items-center justify-between border border-slate-200 shrink-0">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Grade Status</span>
                  <span className="text-[10px] font-bold text-slate-800 block mt-0.5 leading-tight">{gradeInfo.label}</span>
                </div>
                <div className={`h-10 w-10 rounded-lg ${gradeInfo.badgeBg} text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  {gradeInfo.grade}
                </div>
              </div>
            </div>

            {/* Question Breakdown Bar */}
            {totalQuestions ? (
              <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <span>Question Breakdown ({totalQuestions} Questions Total)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-bold">● Correct: {totalCorrect}</span>
                    <span className="text-rose-600 font-bold">● Incorrect: {totalIncorrect}</span>
                    <span className="text-slate-500 font-bold">● Skipped: {totalUnattempted}</span>
                  </div>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  <div style={{ width: `${(totalCorrect / totalQuestions) * 100}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${(totalIncorrect / totalQuestions) * 100}%` }} className="bg-rose-500" />
                  <div style={{ width: `${(totalUnattempted / totalQuestions) * 100}%` }} className="bg-slate-300" />
                </div>
              </div>
            ) : null}

            {/* Section Breakdown Table */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1">
                <BarChart3 size={12} className="text-indigo-600" /> Sectional Breakdown Transcript
              </h2>
              {sections.length ? (
                <table className="w-full border-collapse border border-slate-200 text-[10px] text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[8px] tracking-wider border-b border-slate-200">
                      <th className="p-2 border-r border-slate-200">Subject / Section</th>
                      <th className="p-2 border-r border-slate-200 text-center">Questions</th>
                      <th className="p-2 border-r border-slate-200 text-center">Accuracy %</th>
                      <th className="p-2 border-r border-slate-200 text-center">Correct</th>
                      <th className="p-2 border-r border-slate-200 text-center">Incorrect</th>
                      <th className="p-2 border-r border-slate-200 text-center">Skipped</th>
                      <th className="p-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((sec, idx) => {
                      const acc = Number(sec?.accuracy);
                      return (
                        <tr key={idx} className="border-b border-slate-200 bg-white">
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {sec?.sectionName || `Section ${idx + 1}`}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center text-slate-600">{sec?.totalQuestions ?? '—'}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-indigo-600">
                            {Number.isFinite(acc) ? `${formatNumber(acc)}%` : '—'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-emerald-600">
                            {sec?.correct ?? '—'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-rose-600">
                            {sec?.incorrect ?? '—'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center text-slate-400">
                            {sec?.unattempted ?? '—'}
                          </td>
                          <td className="p-2 text-right font-medium text-slate-700">
                            {formatDuration(sec?.timeSpentSeconds)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-[9px] italic text-slate-400">No section data recorded.</p>
              )}
            </div>

            {/* Evaluator Remarks */}
            <div className="bg-white border border-indigo-200 rounded-lg p-3">
              <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-700 block flex items-center gap-1">
                <Sparkles size={11} className="text-indigo-600" /> Official Assessment Remarks
              </span>
              <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                {scorePercentage >= 85
                  ? 'Exceptional mastery demonstrated across subject domains. Speed and accuracy reflect top-tier subject comprehension.'
                  : scorePercentage >= 70
                  ? 'Strong performant execution. Recommended focus on targeted weak sections to elevate overall accuracy to distinction level.'
                  : scorePercentage >= 50
                  ? 'Satisfactory performance score. Review missed concept areas and refine time allocation during practice sessions.'
                  : 'Additional practice recommended. Focus on core section fundamentals and step-by-step revision.'}
              </p>
            </div>
          </div>
        </div>

        {/* Signature & Validation Footer */}
        <div className="bg-white border-t border-slate-200 p-4 font-sans mt-auto">
          <div className="flex items-end justify-between pt-1">
            <div className="text-center">
              <div className="h-7 border-b border-dashed border-slate-400 w-32 mb-1" />
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Candidate Signature</p>
            </div>

            <div className="rounded-full border border-indigo-300 bg-indigo-50/50 p-2 text-center w-16 h-16 flex flex-col items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-indigo-600" />
              <span className="text-[6px] font-bold uppercase tracking-widest text-indigo-800 mt-0.5">VERIFIED</span>
            </div>

            <div className="text-center">
              <div className="h-7 border-b border-dashed border-slate-400 w-32 mb-1" />
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Controller of Examinations</p>
            </div>
          </div>

          <div className="mt-2 text-center text-[7px] text-slate-400 border-t border-slate-100 pt-1.5">
            <p>Electronically generated official transcript issued by {siteConfig?.name || 'Academic Portal'}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SKELETON & ERROR STATES
   ========================================================= */

function ReportError() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[480px] items-center justify-center p-4">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10">
          <XCircle size={24} />
        </div>
        <h1 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
          Unable to retrieve performance transcript
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The requested report may be processing or is unavailable.
        </p>
        <Link
          href="/history"
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500"
        >
          <ArrowLeft size={14} />
          Return to Test History
        </Link>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-4 p-4 sm:p-8">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}