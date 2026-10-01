'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  CircleSlash2,
  Clock3,
  Printer,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import { useAppSelector } from '../../../../hooks/useAppSelector';
import { useGetAttemptReportQuery } from '../../../../store/reportApi';

const formatNumber = (value, digits = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return number.toFixed(digits);
};

const formatDuration = (seconds) => {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return '—';
  }

  const totalSeconds = Math.round(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

const getScorePercentage = (summary) => {
  const score = Number(summary?.totalScore);
  const maxScore = Number(summary?.maxScore);

  if (
    !Number.isFinite(score) ||
    !Number.isFinite(maxScore) ||
    maxScore <= 0
  ) {
    return null;
  }

  return (score / maxScore) * 100;
};

const getUserName = (user) => {
  const name = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || user?.email || 'Student';
};

export default function AttemptResultPage() {
  const params = useParams();
  const attemptId = params?.id;

  const { user } = useAppSelector(
    (state) => state.auth
  );

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
    />
  );
}

function ReportContent({
  report,
  userName,
}) {
  const summary = report?.summary;

  const sections = Array.isArray(
    report?.sectionBreakdown
  )
    ? report.sectionBreakdown
    : [];

  const scorePercentage =
    getScorePercentage(summary);

  return (
    <>
      {/* =====================================================
          SCREEN REPORT
          ===================================================== */}

      <div className="report-screen mx-auto w-full max-w-[1080px] space-y-3 pb-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={14} />
            Back to history
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
          >
            <Printer size={14} />
            Print result
          </button>
        </div>

        <ScreenHeader
          summary={summary}
          scorePercentage={scorePercentage}
        />

        <ScreenMetrics
          summary={summary}
          scorePercentage={scorePercentage}
        />

        <ScreenScoreOverview
          summary={summary}
          scorePercentage={scorePercentage}
        />

        <ScreenSectionPerformance
          sections={sections}
        />

        <ScreenPeerComparison
          comparison={report?.peerComparison}
        />
      </div>

      {/* =====================================================
          PRINT REPORT
          Completely separate from the web report.
          ===================================================== */}

      <PrintReportCard
        userName={userName}
        summary={summary}
        sections={sections}
        scorePercentage={scorePercentage}
        peerComparison={report?.peerComparison}
      />
    </>
  );
}

/* =========================================================
   SCREEN REPORT
   ========================================================= */

function ScreenHeader({
  summary,
  scorePercentage,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
            Performance report
          </p>

          <h1 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
            Test Performance
          </h1>

          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            Detailed analysis of your completed test
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
              Score
            </p>

            <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">
              {formatNumber(summary?.totalScore)}
              <span className="ml-1 text-xs font-semibold text-slate-400">
                / {formatNumber(summary?.maxScore)}
              </span>
            </p>

            {scorePercentage !== null && (
              <p className="mt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                {formatNumber(scorePercentage, 1)}%
              </p>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
            <Award size={19} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ScreenMetrics({
  summary,
  scorePercentage,
}) {
  return (
    <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <ScreenMetric
        icon={Target}
        label="Score"
        value={
          scorePercentage !== null
            ? `${formatNumber(scorePercentage, 1)}%`
            : '—'
        }
        detail={
          summary?.totalScore !== undefined &&
          summary?.maxScore !== undefined
            ? `${formatNumber(summary.totalScore)} / ${formatNumber(
                summary.maxScore
              )}`
            : null
        }
      />

      <ScreenMetric
        icon={CheckCircle2}
        label="Accuracy"
        value={
          summary?.accuracy !== null &&
          summary?.accuracy !== undefined
            ? `${formatNumber(summary.accuracy)}%`
            : '—'
        }
      />

      <ScreenMetric
        icon={Clock3}
        label="Time"
        value={formatDuration(
          summary?.timeTakenSeconds
        )}
      />

      <ScreenMetric
        icon={TrendingUp}
        label="Percentile"
        value={
          summary?.percentile !== null &&
          summary?.percentile !== undefined
            ? formatNumber(summary.percentile, 2)
            : '—'
        }
        detail={
          summary?.rank !== null &&
          summary?.rank !== undefined
            ? `Rank #${summary.rank}`
            : null
        }
      />
    </section>
  );
}

function ScreenMetric({
  icon: Icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon size={13} />
        </div>
      </div>

      <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      {detail && (
        <p className="mt-0.5 text-[9px] text-slate-400">
          {detail}
        </p>
      )}
    </div>
  );
}

function ScreenScoreOverview({
  summary,
  scorePercentage,
}) {
  const percentage = Math.min(
    Math.max(scorePercentage || 0, 0),
    100
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:px-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Score overview
          </h2>

          <p className="text-[9px] text-slate-400">
            Overall performance
          </p>
        </div>

        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {scorePercentage !== null
            ? `${formatNumber(scorePercentage, 1)}%`
            : '—'}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="shrink-0">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatNumber(summary?.totalScore)}
            <span className="ml-1 text-sm font-semibold text-slate-400">
              / {formatNumber(summary?.maxScore)}
            </span>
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <CompactMetric
          label="Accuracy"
          value={
            summary?.accuracy !== null &&
            summary?.accuracy !== undefined
              ? `${formatNumber(summary.accuracy)}%`
              : '—'
          }
        />

        <CompactMetric
          label="Time"
          value={formatDuration(
            summary?.timeTakenSeconds
          )}
        />

        <CompactMetric
          label="Participants"
          value={
            summary?.totalParticipants !== null &&
            summary?.totalParticipants !== undefined
              ? formatNumber(
                  summary.totalParticipants
                )
              : '—'
          }
        />
      </div>
    </section>
  );
}

function CompactMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function ScreenSectionPerformance({
  sections,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:px-5">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Section performance
        </h2>

        <p className="text-[9px] text-slate-400">
          Accuracy and question breakdown
        </p>
      </div>

      {sections.length ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="hidden grid-cols-[minmax(160px,1fr)_90px_75px_75px_75px_80px] gap-2 bg-slate-50 px-3 py-2 sm:grid dark:bg-slate-950">
            <TableHeading>
              Section
            </TableHeading>

            <TableHeading align="right">
              Accuracy
            </TableHeading>

            <TableHeading align="right">
              Correct
            </TableHeading>

            <TableHeading align="right">
              Incorrect
            </TableHeading>

            <TableHeading align="right">
              Skipped
            </TableHeading>

            <TableHeading align="right">
              Time
            </TableHeading>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {sections.map((section, index) => (
              <ScreenSectionRow
                key={
                  section?.sectionId ||
                  `${section?.sectionName}-${index}`
                }
                section={section}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-slate-50 py-7 text-center dark:bg-slate-950">
          <p className="text-xs text-slate-400">
            Section performance is not available.
          </p>
        </div>
      )}
    </section>
  );
}

function TableHeading({
  children,
  align = 'left',
}) {
  return (
    <p
      className={`text-[8px] font-bold uppercase tracking-wider text-slate-400 ${
        align === 'right'
          ? 'text-right'
          : ''
      }`}
    >
      {children}
    </p>
  );
}

function ScreenSectionRow({
  section,
}) {
  const accuracy = Number(section?.accuracy);

  return (
    <div className="px-3 py-2.5">
      <div className="grid gap-2 sm:grid-cols-[minmax(160px,1fr)_90px_75px_75px_75px_80px] sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {section?.sectionName || 'Section'}
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            {section?.totalQuestions ?? '—'} questions
          </p>
        </div>

        <SectionValue
          label="Accuracy"
          value={
            Number.isFinite(accuracy)
              ? `${formatNumber(accuracy)}%`
              : '—'
          }
          accent
        />

        <SectionValue
          label="Correct"
          value={section?.correct}
          icon={CheckCircle2}
          iconClass="text-emerald-500 dark:text-emerald-400"
        />

        <SectionValue
          label="Incorrect"
          value={section?.incorrect}
          icon={XCircle}
          iconClass="text-rose-500 dark:text-rose-400"
        />

        <SectionValue
          label="Skipped"
          value={section?.unattempted}
          icon={CircleSlash2}
          iconClass="text-slate-400"
        />

        <SectionValue
          label="Time"
          value={formatDuration(
            section?.timeSpentSeconds
          )}
          icon={Clock3}
          iconClass="text-slate-400"
        />
      </div>
    </div>
  );
}

function SectionValue({
  label,
  value,
  icon: Icon,
  iconClass,
  accent,
}) {
  return (
    <div className="flex items-center justify-between sm:block sm:text-right">
      <div className="flex items-center gap-1 sm:justify-end">
        {Icon && (
          <Icon
            size={11}
            className={iconClass}
          />
        )}

        <span className="text-[8px] text-slate-400 sm:hidden">
          {label}
        </span>
      </div>

      <p
        className={`text-[11px] font-bold ${
          accent
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {value ?? '—'}
      </p>
    </div>
  );
}

function ScreenPeerComparison({
  comparison,
}) {
  if (!comparison) {
    return null;
  }

  const entries = Object.entries(
    comparison
  ).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      typeof value !== 'object'
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:px-5">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
        Peer comparison
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950"
          >
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
              {formatLabel(key)}
            </p>

            <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              {String(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PRINT REPORT CARD
   ========================================================= */

function PrintReportCard({
  userName,
  summary,
  sections,
  scorePercentage,
  peerComparison,
}) {
  const totalQuestions = sections.length
    ? sections.reduce(
        (total, section) =>
          total +
          Number(section?.totalQuestions || 0),
        0
      )
    : null;

  return (
    <div className="report-print hidden bg-white text-black print:block">
      <div className="mx-auto min-h-[297mm] w-[210mm] px-[18mm] py-[16mm]">
        <div className="flex min-h-[265mm] flex-col">
          <PrintDocumentHeader
            userName={userName}
          />

          <PrintResultHero
            summary={summary}
            scorePercentage={scorePercentage}
          />

          <PrintResultDetails
            summary={summary}
            totalQuestions={totalQuestions}
          />

          <PrintSectionTable
            sections={sections}
          />

          {peerComparison && (
            <PrintPeerComparison
              comparison={peerComparison}
            />
          )}

          <PrintDocumentFooter />
        </div>
      </div>
    </div>
  );
}

function PrintDocumentHeader({
  userName,
}) {
  return (
    <header className="border-b-2 border-black pb-5 text-center">
      <p className="text-[22px] font-bold tracking-tight">
        TestHub
      </p>

      <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.35em]">
        Statement of Performance
      </p>

      <div className="mt-5">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Student
        </p>

        <p className="mt-1 text-[16px] font-bold">
          {userName}
        </p>
      </div>
    </header>
  );
}

function PrintResultHero({
  summary,
  scorePercentage,
}) {
  return (
    <section className="border-b border-black py-7 text-center">
      <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-slate-500">
        Overall Score
      </p>

      <p className="mt-2 text-[38px] font-bold leading-none">
        {formatNumber(summary?.totalScore)}
        <span className="ml-2 text-[16px] font-medium text-slate-500">
          / {formatNumber(summary?.maxScore)}
        </span>
      </p>

      <p className="mt-3 text-[18px] font-bold">
        {scorePercentage !== null
          ? `${formatNumber(scorePercentage, 1)}%`
          : '—'}
      </p>
    </section>
  );
}

function PrintResultDetails({
  summary,
  totalQuestions,
}) {
  return (
    <section className="border-b border-slate-400 py-5">
      <div className="grid grid-cols-3">
        <PrintDetailCell
          label="Accuracy"
          value={
            summary?.accuracy !== null &&
            summary?.accuracy !== undefined
              ? `${formatNumber(summary.accuracy)}%`
              : '—'
          }
        />

        <PrintDetailCell
          label="Percentile"
          value={
            summary?.percentile !== null &&
            summary?.percentile !== undefined
              ? formatNumber(
                  summary.percentile,
                  2
                )
              : '—'
          }
        />

        <PrintDetailCell
          label="Rank"
          value={
            summary?.rank !== null &&
            summary?.rank !== undefined
              ? `#${summary.rank}`
              : '—'
          }
        />

        <PrintDetailCell
          label="Time Taken"
          value={formatDuration(
            summary?.timeTakenSeconds
          )}
        />

        <PrintDetailCell
          label="Participants"
          value={
            summary?.totalParticipants !== null &&
            summary?.totalParticipants !== undefined
              ? formatNumber(
                  summary.totalParticipants
                )
              : '—'
          }
        />

        <PrintDetailCell
          label="Questions"
          value={
            totalQuestions !== null
              ? formatNumber(totalQuestions)
              : '—'
          }
        />
      </div>
    </section>
  );
}

function PrintDetailCell({
  label,
  value,
}) {
  return (
    <div className="border-b border-slate-200 px-4 py-3 first:pl-0 [&:nth-child(3n+1)]:pl-0 [&:nth-child(3n)]:pr-0">
      <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-semibold">
        {value}
      </p>
    </div>
  );
}

function PrintSectionTable({
  sections,
}) {
  return (
    <section className="mt-7">
      <div className="border-b-2 border-black pb-2">
        <h2 className="text-[9px] font-bold uppercase tracking-[0.18em]">
          Section Performance
        </h2>
      </div>

      {sections.length ? (
        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="border-b border-black">
              <PrintTableHeading>
                Section
              </PrintTableHeading>

              <PrintTableHeading align="right">
                Questions
              </PrintTableHeading>

              <PrintTableHeading align="right">
                Accuracy
              </PrintTableHeading>

              <PrintTableHeading align="right">
                Correct
              </PrintTableHeading>

              <PrintTableHeading align="right">
                Incorrect
              </PrintTableHeading>

              <PrintTableHeading align="right">
                Skipped
              </PrintTableHeading>

              <PrintTableHeading align="right">
                Time
              </PrintTableHeading>
            </tr>
          </thead>

          <tbody>
            {sections.map((section, index) => {
              const accuracy = Number(
                section?.accuracy
              );

              return (
                <tr
                  key={
                    section?.sectionId ||
                    `${section?.sectionName}-${index}`
                  }
                  className="border-b border-slate-300"
                >
                  <td className="py-3 text-[9px] font-semibold">
                    {section?.sectionName ||
                      'Section'}
                  </td>

                  <td className="py-3 text-right text-[9px]">
                    {section?.totalQuestions ??
                      '—'}
                  </td>

                  <td className="py-3 text-right text-[9px] font-semibold">
                    {Number.isFinite(accuracy)
                      ? `${formatNumber(accuracy)}%`
                      : '—'}
                  </td>

                  <td className="py-3 text-right text-[9px]">
                    {section?.correct ?? '—'}
                  </td>

                  <td className="py-3 text-right text-[9px]">
                    {section?.incorrect ?? '—'}
                  </td>

                  <td className="py-3 text-right text-[9px]">
                    {section?.unattempted ?? '—'}
                  </td>

                  <td className="py-3 text-right text-[9px]">
                    {formatDuration(
                      section?.timeSpentSeconds
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="mt-3 text-[9px] text-slate-500">
          Section performance is not available.
        </p>
      )}
    </section>
  );
}

function PrintTableHeading({
  children,
  align = 'left',
}) {
  return (
    <th
      className={`py-2 text-[7px] font-bold uppercase tracking-wider text-slate-500 ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function PrintPeerComparison({
  comparison,
}) {
  const entries = Object.entries(
    comparison || {}
  ).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      typeof value !== 'object'
  );

  if (!entries.length) {
    return null;
  }

  return (
    <section className="mt-7">
      <div className="border-b-2 border-black pb-2">
        <h2 className="text-[9px] font-bold uppercase tracking-[0.18em]">
          Peer Comparison
        </h2>
      </div>

      <div className="mt-3 grid grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between border-b border-slate-200 py-2.5 pr-8"
          >
            <span className="text-[8px] text-slate-500">
              {formatLabel(key)}
            </span>

            <span className="text-[9px] font-semibold">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrintDocumentFooter() {
  return (
    <footer className="mt-auto border-t border-black pt-4 text-center">
      <p className="text-[7px] uppercase tracking-[0.25em] text-slate-500">
        TestHub
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Performance Report
      </p>
    </footer>
  );
}

/* =========================================================
   STATES
   ========================================================= */

function ReportError() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[520px] items-center justify-center">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
          <XCircle size={19} />
        </div>

        <h1 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
          Unable to load your report
        </h1>

        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Your result may still be processing.
        </p>

        <Link
          href="/history"
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[10px] font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <ArrowLeft size={13} />
          Back to history
        </Link>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1080px] space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

        <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>

      <div className="h-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

      <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function formatLabel(value) {
  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}