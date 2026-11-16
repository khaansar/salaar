'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MathText } from '@/components/common/MathText';
import { BrandIcon } from '@/components/common/BrandLogo';
import { siteConfig } from '@/config/site';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  formatDate, formatNumber, normalizeImages, normalizeOptions, parseAnswerKeys, statusOf,
} from '../lib/reviewFormat';

/*
 * Print-only copy of the review: every question, section by section, in two
 * columns per A4 page. It is mounted only while printing, and the print
 * dialog opens once its images have loaded (or after IMAGE_WAIT_LIMIT_MS, so
 * one broken image cannot block printing).
 */

const IMAGE_WAIT_LIMIT_MS = 15000;

const STATUS_PRINT = {
  CORRECT: { label: 'Correct', text: 'text-emerald-700' },
  WRONG: { label: 'Incorrect', text: 'text-rose-700' },
  UNANSWERED: { label: 'Unanswered', text: 'text-amber-700' },
};

function waitForImages(root) {
  if (!root) return Promise.resolve();
  const loads = [...root.querySelectorAll('img')]
    .filter((img) => !img.complete)
    .map((img) => new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const limit = new Promise((resolve) => { setTimeout(resolve, IMAGE_WAIT_LIMIT_MS); });
  return Promise.race([Promise.all([...loads, fonts]), limit]);
}

/** Mounts the sheet, waits for its images, prints, then unmounts it. */
export function useReviewPrint() {
  const [isPreparing, setIsPreparing] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!isPreparing) return undefined;
    let cancelled = false;
    const finish = () => setIsPreparing(false);
    window.addEventListener('afterprint', finish);
    waitForImages(sheetRef.current).then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
      window.removeEventListener('afterprint', finish);
    };
  }, [isPreparing]);

  const startPrint = useCallback(() => setIsPreparing(true), []);
  return { isPreparing, startPrint, sheetRef };
}

function groupBySection(questions, sections) {
  const marksById = new Map(sections.map((s) => [String(s.sectionId), s.marksAwarded]));
  const groups = new Map();
  questions.forEach((question, index) => {
    const id = String(question.sectionId ?? 'none');
    if (!groups.has(id)) {
      groups.set(id, {
        id, title: question.sectionTitle || 'Section', marks: marksById.get(id), correct: 0, items: [],
      });
    }
    const group = groups.get(id);
    group.items.push({ question, number: index + 1 });
    if (statusOf(question) === 'CORRECT') group.correct += 1;
  });
  return [...groups.values()];
}

function PrintImages({ images }) {
  const normalized = normalizeImages(images);
  if (!normalized.length) return null;
  return (
    <div className="mt-1 space-y-1">
      {normalized.map((image, index) => (
        <figure key={`${image.url}-${index}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.altText || `Image ${index + 1}`} loading="eager"
            className="max-h-[50mm] max-w-full object-contain" />
          {image.caption && <figcaption className="text-[9px] text-slate-500">{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function answerLabel(answer, options, emptyText) {
  const ids = parseAnswerKeys(answer);
  if (!ids.length) return emptyText;
  const byId = new Map(options.map((o) => [o.id, o.label]));
  return ids.map((id) => byId.get(id) ?? id).join(', ');
}

function PrintQuestion({ question, number }) {
  const key = statusOf(question);
  const status = STATUS_PRINT[key];
  const options = normalizeOptions(question.options);
  const optionImages = question.optionImages && typeof question.optionImages === 'object' ? question.optionImages : {};
  const selectedIds = parseAnswerKeys(question.selectedOption);
  const correctIds = parseAnswerKeys(question.correctOption);
  const awarded = Number(question.marksAwarded);

  return (
    <article className="mb-3 break-inside-avoid border-b border-slate-200 pb-2">
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="font-bold">Q{number}.</span>
        <span className={`text-[9.5px] font-semibold ${status.text}`}>
          {status.label} · {awarded > 0 ? '+' : ''}{formatNumber(question.marksAwarded)}
        </span>
      </div>
      <MathText text={question.questionText || 'Question text unavailable'} className="break-words" />
      <PrintImages images={question.questionImages} />

      {options.length > 0 && (
        <ol className="mt-1 space-y-0.5">
          {options.map((option) => {
            const isCorrect = correctIds.includes(option.id);
            const isSelected = selectedIds.includes(option.id);
            const tone = isCorrect
              ? 'bg-emerald-50 ring-1 ring-emerald-500'
              : isSelected ? 'bg-rose-50 ring-1 ring-rose-500' : '';
            return (
              <li key={option.id} className={`flex gap-1.5 rounded px-1 py-0.5 ${tone}`}>
                <span className="font-bold">({option.label})</span>
                <div className="min-w-0 flex-1">
                  <MathText text={option.text || '—'} className="break-words" />
                  <PrintImages images={optionImages[option.id]} />
                </div>
                {(isCorrect || isSelected) && (
                  <span className="shrink-0 text-[9px] font-semibold">
                    {isCorrect && <span className="text-emerald-700">✓ Correct</span>}
                    {isCorrect && isSelected && ' · '}
                    {isSelected && <span className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>Your answer</span>}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-1 grid grid-cols-2 gap-x-2 rounded bg-slate-100 px-1.5 py-1">
        <span>
          <span className="text-slate-500">Your answer: </span>
          <strong className={status.text}>{answerLabel(question.selectedOption, options, 'Not answered')}</strong>
        </span>
        <span>
          <span className="text-slate-500">Correct answer: </span>
          <strong className="text-emerald-700">{answerLabel(question.correctOption, options, '—')}</strong>
        </span>
      </p>
    </article>
  );
}

/* Same rule as the result report: full name, falling back to the email. */
function studentName(user) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || user?.email || 'Student';
}

export default function ReviewPrintSheet({ review, questions, sections, counts, sheetRef }) {
  const user = useAppSelector((state) => state.auth.user);
  if (typeof document === 'undefined') return null;
  const groups = groupBySection(questions, sections);

  return createPortal(
    <div ref={sheetRef} className="review-print-root bg-white font-sans text-[10.5px] leading-snug text-slate-900">
      <header className="mb-3 flex items-end justify-between gap-4 border-b-2 border-slate-900 pb-2">
        <div className="flex items-center gap-2">
          <BrandIcon size="sm" />
          <span className="text-2xl font-black tracking-tight text-slate-900">{siteConfig.name || 'ClearIt'}</span>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-slate-900">{studentName(user)}</p>
          <p className="text-slate-600">
            Score {formatNumber(review.finalScore)} · {counts.CORRECT} correct · {counts.WRONG} incorrect · {counts.UNANSWERED} unanswered
          </p>
          <p className="text-slate-500">Submitted {formatDate(review.updatedAt || review.createdAt)}</p>
        </div>
      </header>

      {groups.map((group, index) => (
        <section key={group.id} className={index > 0 ? 'break-before-page' : ''}>
          <h2 className="mb-2 flex items-baseline justify-between border-b border-slate-300 pb-1 text-sm font-bold">
            <span>{group.title}</span>
            <span className="text-[10px] font-normal text-slate-600">
              {group.correct}/{group.items.length} correct
              {group.marks !== undefined && ` · ${formatNumber(group.marks)} marks`}
            </span>
          </h2>
          <div className="columns-2 gap-x-[6mm] [column-rule:1px_solid_#e2e8f0]">
            {group.items.map(({ question, number }) => (
              <PrintQuestion key={question.questionId ?? number} question={question} number={number} />
            ))}
          </div>
        </section>
      ))}
    </div>,
    document.body,
  );
}
