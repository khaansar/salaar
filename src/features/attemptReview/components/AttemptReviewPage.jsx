'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpenCheck, CheckCircle2, CircleHelp, LoaderCircle,
  RefreshCw, Search, SlidersHorizontal, X, XCircle,
} from 'lucide-react';
import StudentShell from '@/components/student/StudentShell';
import attemptReviewService from '@/services/attemptReviewService';

/* ------------------------------------------------------------------ */
/* Theme tokens                                                        */
/* Every colour is a light/dark pair. Surfaces step up in lightness    */
/* on dark (950 → 900 → 800) instead of using borders alone, and tinted */
/* backgrounds use low-alpha fills with 300-level text for contrast.   */
/* ------------------------------------------------------------------ */
const T = {
  surface: 'bg-white dark:bg-slate-900',
  raised: 'bg-slate-50 dark:bg-slate-800/60',
  border: 'border-slate-200 dark:border-slate-800',
  borderStrong: 'border-slate-300 dark:border-slate-700',
  text: 'text-slate-900 dark:text-slate-50',
  body: 'text-slate-700 dark:text-slate-300',
  muted: 'text-slate-500 dark:text-slate-400',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  accent: 'text-indigo-700 dark:text-indigo-300',
};

const STATUS = {
  CORRECT: {
    label: 'Correct',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500 dark:bg-emerald-400',
    stripe: 'border-l-emerald-500 dark:border-l-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    cell: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25',
    text: 'text-emerald-700 dark:text-emerald-300',
    option: 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10',
    chip: 'border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300',
  },
  WRONG: {
    label: 'Incorrect',
    icon: XCircle,
    dot: 'bg-rose-500',
    bar: 'bg-rose-500 dark:bg-rose-400',
    stripe: 'border-l-rose-500 dark:border-l-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    cell: 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25',
    text: 'text-rose-700 dark:text-rose-300',
    option: 'border-rose-400 bg-rose-50 dark:border-rose-500/60 dark:bg-rose-500/10',
    chip: 'border-rose-500 text-rose-700 dark:border-rose-400 dark:text-rose-300',
  },
  UNANSWERED: {
    label: 'Unanswered',
    icon: CircleHelp,
    dot: 'bg-amber-500',
    bar: 'bg-amber-400 dark:bg-amber-400',
    stripe: 'border-l-amber-500 dark:border-l-amber-400',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300',
    cell: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25',
    text: 'text-amber-800 dark:text-amber-300',
    option: '',
    chip: '',
  },
};

const statusOf = (q) => {
  const key = String(q?.status || 'UNANSWERED').toUpperCase();
  return STATUS[key] ? key : 'UNANSWERED';
};

/* ------------------------------------------------------------------ */
/* Data helpers                                                        */
/* ------------------------------------------------------------------ */
function asNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value) {
  const number = asNumber(value);
  if (number === null) return '—';
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function parseAnswerKeys(value) {
  if (value === null || value === undefined || value === '') return [];
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  const raw = String(value).trim();
  if (!raw) return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).map((v) => v.trim()).filter(Boolean);
    } catch {
      return raw.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    }
  }
  return raw.includes(',') ? raw.split(',').map((v) => v.trim()).filter(Boolean) : [raw];
}

/* Backend options are { optionId: optionText }. Keep the real ID for matching, show A/B/C/D. */
function normalizeOptions(options) {
  let entries = [];
  if (Array.isArray(options)) {
    entries = options.map((option, index) => {
      if (option && typeof option === 'object') {
        const id = option.optionId ?? option.id ?? option.key ?? option.optionKey ?? String(index);
        const text = option.text ?? option.label ?? option.value ?? option.content ?? '';
        return [String(id), typeof text === 'string' ? text : JSON.stringify(text)];
      }
      return [String(index), String(option ?? '')];
    });
  } else if (options && typeof options === 'object') {
    entries = Object.entries(options).map(([id, text]) => [
      id,
      typeof text === 'string' ? text : text == null ? '' : String(text.text ?? text.label ?? text.value ?? JSON.stringify(text)),
    ]);
  } else if (typeof options === 'string') {
    try { return normalizeOptions(JSON.parse(options)); } catch { return []; }
  }
  return entries.map(([id, text], index) => ({ id, label: String.fromCharCode(65 + (index % 26)), text }));
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((image) => {
    if (typeof image === 'string') return { url: image, altText: '' };
    if (!image || typeof image !== 'object') return null;
    return {
      url: image.url ?? image.imageUrl ?? image.src ?? '',
      altText: image.altText ?? image.alt_text ?? image.caption ?? '',
    };
  }).filter((image) => typeof image?.url === 'string' && image.url.trim());
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */
function ImageList({ images }) {
  const normalized = normalizeImages(images);
  if (!normalized.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {normalized.map((image, index) => (
        <a key={`${image.url}-${index}`} href={image.url} target="_blank" rel="noreferrer" className={`block max-w-full rounded-lg ${T.focus}`}>
          {/* Images sit on a light plate so diagrams with transparent/black backgrounds stay legible in dark mode */}
          <img src={image.url} alt={image.altText || `Question image ${index + 1}`} loading="lazy"
            className={`max-h-72 max-w-full rounded-lg border bg-white object-contain ${T.borderStrong}`} />
          {image.altText && <span className={`mt-1 block text-xs ${T.muted}`}>{image.altText}</span>}
        </a>
      ))}
    </div>
  );
}

function AnswerText({ answer, options }) {
  const ids = parseAnswerKeys(answer);
  if (!ids.length) return <span className={`italic ${T.muted}`}>Not answered</span>;
  const byId = new Map(options.map((o) => [o.id, o]));
  return (
    <span>
      {ids.map((id, i) => {
        const option = byId.get(id);
        return (
          <span key={id}>
            {i > 0 && ', '}
            <strong className={T.text}>{option?.label ?? id}</strong>
            {option?.text ? <span className={T.body}> {option.text}</span> : null}
          </span>
        );
      })}
    </span>
  );
}

function ScoreSummary({ review, counts, total }) {
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const accuracy = total ? Math.round(pct(counts.CORRECT)) : 0;
  return (
    <section aria-label="Attempt summary" className={`rounded-2xl border p-5 sm:p-6 ${T.border} ${T.surface}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className={`text-sm ${T.muted}`}>Final score</p>
          <p className={`mt-1 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl ${T.text}`}>{formatNumber(review.finalScore)}</p>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          {['CORRECT', 'WRONG', 'UNANSWERED'].map((key) => (
            <div key={key}>
              <dt className={`flex items-center gap-2 text-sm ${T.muted}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS[key].dot}`} aria-hidden />{STATUS[key].label}
              </dt>
              <dd className={`mt-0.5 text-2xl font-semibold tabular-nums ${T.text}`}>{counts[key]}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-5">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="img"
          aria-label={`${counts.CORRECT} correct, ${counts.WRONG} incorrect, ${counts.UNANSWERED} unanswered of ${total}`}>
          {['CORRECT', 'WRONG', 'UNANSWERED'].map((key) => (
            <div key={key} className={STATUS[key].bar} style={{ width: `${pct(counts[key])}%` }} />
          ))}
        </div>
        <p className={`mt-2 text-xs ${T.muted}`}>{accuracy}% correct across {total} questions</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar: search, status, sections, navigator                        */
/* ------------------------------------------------------------------ */
function FilterPanel({
  questions, sections, counts, sectionCounts, visibleIds,
  statusFilter, setStatusFilter, sectionFilter, setSectionFilter,
  search, setSearch, onJump, onReset, hasFilters,
}) {
  const rowBase = `flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${T.focus}`;
  const rowIdle = 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
  const rowOn = 'bg-indigo-50 font-semibold text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200';
  const heading = `px-3 text-sm font-semibold ${T.text}`;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search size={16} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${T.muted}`} aria-hidden />
        <label htmlFor="review-search" className="sr-only">Search questions</label>
        <input id="review-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question text"
          className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 ${T.borderStrong} bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${T.focus}`} />
      </div>

      <div>
        <h2 className={heading}>Result</h2>
        <div className="mt-2 space-y-0.5" role="group" aria-label="Filter by result">
          {[['ALL', 'All questions', questions.length], ...['CORRECT', 'WRONG', 'UNANSWERED'].map((k) => [k, STATUS[k].label, counts[k]])].map(([key, label, n]) => (
            <button key={key} type="button" aria-pressed={statusFilter === key} onClick={() => setStatusFilter(key)}
              className={`${rowBase} ${statusFilter === key ? rowOn : rowIdle}`}>
              <span className="flex items-center gap-2.5">
                {key !== 'ALL' && <span className={`h-2.5 w-2.5 rounded-full ${STATUS[key].dot}`} aria-hidden />}
                {label}
              </span>
              <span className="tabular-nums opacity-80">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {sections.length > 0 && (
        <div>
          <h2 className={heading}>Sections</h2>
          <div className="mt-2 space-y-0.5" role="group" aria-label="Filter by section">
            <button type="button" aria-pressed={sectionFilter === 'ALL'} onClick={() => setSectionFilter('ALL')}
              className={`${rowBase} ${sectionFilter === 'ALL' ? rowOn : rowIdle}`}>
              <span>All sections</span>
            </button>
            {sections.map((section) => {
              const id = String(section.sectionId);
              const c = sectionCounts[id] || { total: 0, correct: 0 };
              return (
                <button key={id} type="button" aria-pressed={sectionFilter === id} onClick={() => setSectionFilter(id)}
                  className={`${rowBase} ${sectionFilter === id ? rowOn : rowIdle}`}>
                  <span className="min-w-0">
                    <span className="block truncate">{section.sectionTitle || 'Section'}</span>
                    <span className={`block text-xs font-normal ${sectionFilter === id ? '' : T.muted}`}>
                      {c.correct}/{c.total} correct · {formatNumber(section.marksAwarded)} marks
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className={heading}>Jump to question</h2>
        <div className="mt-3 grid grid-cols-6 gap-1.5 px-1" role="group" aria-label="Question navigator">
          {questions.map((q, i) => {
            const s = STATUS[statusOf(q)];
            const visible = visibleIds.has(q.questionId);
            return (
              <button key={q.questionId ?? i} type="button" onClick={() => onJump(i)}
                aria-label={`Question ${i + 1}, ${s.label}`}
                className={`aspect-square rounded-md text-xs font-semibold tabular-nums transition ${s.cell} ${visible ? '' : 'opacity-35'} ${T.focus}`}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {hasFilters && (
        <button type="button" onClick={onReset}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${T.borderStrong} ${T.body} hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`}>
          <RefreshCw size={14} />Clear filters
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Question card                                                       */
/* ------------------------------------------------------------------ */
function QuestionCard({ question, index }) {
  const key = statusOf(question);
  const s = STATUS[key];
  const StatusIcon = s.icon;
  const options = normalizeOptions(question.options);
  const optionImages = question.optionImages && typeof question.optionImages === 'object' ? question.optionImages : {};
  const selectedIds = parseAnswerKeys(question.selectedOption);
  const correctIds = parseAnswerKeys(question.correctOption);
  const type = String(question.questionType || '').replaceAll('_', ' ').toLowerCase();
  const awarded = asNumber(question.marksAwarded);
  const hasExplanation = question.explanation || normalizeImages(question.explanationImages).length > 0;

  return (
    <article id={`question-${index + 1}`}
      className={`scroll-mt-24 rounded-2xl border border-l-4 ${T.border} ${s.stripe} ${T.surface}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className={`text-base font-semibold ${T.text}`}>Question {index + 1}</h3>
          {(question.sectionTitle || type) && (
            <p className={`text-sm ${T.muted}`}>{[question.sectionTitle, type].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold tabular-nums ${awarded !== null && awarded < 0 ? STATUS.WRONG.text : T.text}`}>
            {awarded !== null && awarded > 0 ? '+' : ''}{formatNumber(awarded)}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
            <StatusIcon size={14} aria-hidden />{s.label}
          </span>
        </div>
      </header>

      <div className="space-y-4 px-5 pb-5 pt-3">
        <div>
          <div className={`whitespace-pre-wrap break-words text-[15px] leading-7 ${T.text}`}>
            {question.questionText || 'Question text unavailable'}
          </div>
          <ImageList images={question.questionImages} />
        </div>

        {options.length > 0 && (
          <ul className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              const isCorrect = correctIds.includes(option.id);
              const tone = isCorrect ? STATUS.CORRECT : isSelected ? STATUS.WRONG : null;
              return (
                <li key={option.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${tone ? tone.option : `${T.borderStrong} ${T.surface}`}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${tone ? tone.chip : `${T.borderStrong} ${T.body}`}`}>
                    {option.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`whitespace-pre-wrap break-words text-sm leading-6 ${T.text}`}>{option.text || '—'}</p>
                    {(isCorrect || isSelected) && (
                      <p className="mt-1 flex flex-wrap gap-x-3 text-xs font-semibold">
                        {isCorrect && <span className={STATUS.CORRECT.text}>Correct answer</span>}
                        {isSelected && <span className={isCorrect ? STATUS.CORRECT.text : STATUS.WRONG.text}>Your answer</span>}
                      </p>
                    )}
                    <ImageList images={optionImages[option.id]} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className={`grid gap-x-6 gap-y-1 rounded-xl p-3.5 text-sm sm:grid-cols-2 ${T.raised}`}>
          <p><span className={T.muted}>Your answer: </span><AnswerText answer={question.selectedOption} options={options} /></p>
          <p><span className={T.muted}>Correct answer: </span><AnswerText answer={question.correctOption} options={options} /></p>
        </div>

        <p className={`text-xs ${T.muted}`}>
          Worth {formatNumber(question.positiveMarks)}, negative marking {formatNumber(question.negativeMarks)}
        </p>

        {hasExplanation && (
          <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              <BookOpenCheck size={16} aria-hidden />Explanation
            </h4>
            {question.explanation && (
              <p className={`mt-2 max-w-[75ch] whitespace-pre-wrap break-words text-sm leading-6 ${T.body}`}>{question.explanation}</p>
            )}
            <ImageList images={question.explanationImages} />
          </section>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */
function LoadingState() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-6">
      <div className={`flex items-center gap-3 text-sm ${T.muted}`} role="status">
        <LoaderCircle size={20} className="animate-spin" />Loading your attempt review…
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-6">
      <div className={`w-full max-w-lg rounded-2xl border p-7 text-center ${T.border} ${T.surface}`}>
        <XCircle size={28} className="mx-auto text-rose-500 dark:text-rose-400" aria-hidden />
        <h1 className={`mt-3 text-lg font-semibold ${T.text}`}>Couldn’t load this review</h1>
        <p className={`mt-2 text-sm leading-6 ${T.muted}`}>{message}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onRetry}
            className={`inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-slate-950 ${T.focus}`}>
            <RefreshCw size={15} />Try again
          </button>
          <Link href="/history" className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold ${T.borderStrong} ${T.body} hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`}>
            Back to attempts
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function AttemptReviewPage({ attemptId }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadReview = useCallback(async () => {
    if (!attemptId) {
      setError('The attempt ID is missing from the URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setReview(await attemptReviewService.getReview(attemptId));
    } catch (loadError) {
      setError(loadError?.message || 'Something went wrong while loading this review.');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => { loadReview(); }, [loadReview]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [drawerOpen]);

  const questions = useMemo(() => (Array.isArray(review?.questions) ? review.questions : []), [review]);
  const sections = useMemo(() => (Array.isArray(review?.sections) ? review.sections : []), [review]);

  const counts = useMemo(() => {
    const c = { CORRECT: 0, WRONG: 0, UNANSWERED: 0 };
    questions.forEach((q) => { c[statusOf(q)] += 1; });
    return c;
  }, [questions]);

  const sectionCounts = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      const id = String(q.sectionId);
      map[id] ||= { total: 0, correct: 0 };
      map[id].total += 1;
      if (statusOf(q) === 'CORRECT') map[id].correct += 1;
    });
    return map;
  }, [questions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (sectionFilter !== 'ALL' && String(q.sectionId) !== sectionFilter) return false;
      if (statusFilter !== 'ALL' && statusOf(q) !== statusFilter) return false;
      if (term && !String(q.questionText || '').toLowerCase().includes(term)) return false;
      return true;
    });
  }, [questions, sectionFilter, statusFilter, search]);

  const visibleIds = useMemo(() => new Set(filtered.map((q) => q.questionId)), [filtered]);
  const hasFilters = sectionFilter !== 'ALL' || statusFilter !== 'ALL' || search.trim() !== '';

  const resetFilters = () => { setSectionFilter('ALL'); setStatusFilter('ALL'); setSearch(''); };

  const jumpTo = (index) => {
    const target = questions[index];
    if (!target) return;
    if (!visibleIds.has(target.questionId)) resetFilters();
    setDrawerOpen(false);
    setTimeout(() => {
      document.getElementById(`question-${index + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  if (loading) return <StudentShell><LoadingState /></StudentShell>;
  if (error || !review) {
    return <StudentShell><ErrorState message={error || 'No review data was returned.'} onRetry={loadReview} /></StudentShell>;
  }

  const panel = (
    <FilterPanel
      questions={questions} sections={sections} counts={counts} sectionCounts={sectionCounts} visibleIds={visibleIds}
      statusFilter={statusFilter} setStatusFilter={setStatusFilter}
      sectionFilter={sectionFilter} setSectionFilter={setSectionFilter}
      search={search} setSearch={setSearch} onJump={jumpTo} onReset={resetFilters} hasFilters={hasFilters}
    />
  );

  return (
    <StudentShell>
      <main className={`min-h-full ${T.text}`}>
        <div className="mx-auto max-w-6xl space-y-6 pb-10">
          <header>
            <Link href="/history" className={`inline-flex items-center gap-2 rounded text-sm font-medium ${T.muted} hover:text-indigo-700 dark:hover:text-indigo-300 ${T.focus}`}>
              <ArrowLeft size={16} aria-hidden />Back to attempts
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Attempt review</h1>
                <p className={`mt-1 text-sm ${T.muted}`}>Submitted {formatDate(review.updatedAt || review.createdAt)}</p>
              </div>
              <Link href="/my-learning"
                className={`inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:text-slate-950 dark:hover:bg-indigo-400 ${T.focus}`}>
                My Learning
              </Link>
            </div>
          </header>

          <ScoreSummary review={review} counts={counts} total={questions.length} />

          {/* Mobile / tablet filter trigger */}
          <div className="sticky top-2 z-20 lg:hidden">
            <button type="button" onClick={() => setDrawerOpen(true)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${T.borderStrong} ${T.surface} ${T.text} ${T.focus}`}>
              <span className="flex items-center gap-2"><SlidersHorizontal size={16} aria-hidden />Filters and question list</span>
              <span className={`font-normal ${T.muted}`}>{filtered.length} of {questions.length}</span>
            </button>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[288px_minmax(0,1fr)]">
            <aside aria-label="Filters" className={`hidden rounded-2xl border p-4 lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto ${T.border} ${T.surface}`}>
              {panel}
            </aside>

            <section aria-label="Questions" className="min-w-0 space-y-4">
              <p className={`text-sm ${T.muted}`} aria-live="polite">
                Showing {filtered.length} of {questions.length} questions
              </p>
              {filtered.length === 0 ? (
                <div className={`rounded-2xl border p-10 text-center ${T.border} ${T.surface}`}>
                  <p className={`font-semibold ${T.text}`}>No questions match these filters</p>
                  <p className={`mt-1 text-sm ${T.muted}`}>Try a different result, section or search term.</p>
                  <button type="button" onClick={resetFilters}
                    className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold ${T.borderStrong} ${T.body} hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`}>
                    <RefreshCw size={14} />Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((question) => (
                  <QuestionCard key={question.questionId} question={question}
                    index={questions.findIndex((item) => item.questionId === question.questionId)} />
                ))
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Mobile bottom sheet */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters and question list">
          <button type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/50 dark:bg-black/70" />
          <div className={`absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t shadow-xl ${T.border} ${T.surface}`}>
            <div className={`flex items-center justify-between border-b px-4 py-3 ${T.border}`}>
              <h2 className={`font-semibold ${T.text}`}>Filters and question list</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close"
                className={`rounded-lg p-1.5 ${T.muted} hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`}><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4">{panel}</div>
            <div className={`border-t p-3 ${T.border}`}>
              <button type="button" onClick={() => setDrawerOpen(false)}
                className={`w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:text-slate-950 dark:hover:bg-indigo-400 ${T.focus}`}>
                Show {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentShell>
  );
}