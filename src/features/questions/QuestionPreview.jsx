'use client';

import React, { useMemo, useState } from 'react';
import { Check, Lightbulb, Pencil, Hash, FileText, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { MathText } from '@/components/common/MathText';
import { QuestionImages } from '@/components/common/QuestionImages';
import {
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_BADGE_STYLES,
  DIFFICULTY_BADGE_STYLES,
} from '@/constants/enums';

function parseOptions(translation) {
  if (!translation?.optionsJson) return [];

  try {
    const parsed =
      typeof translation.optionsJson === 'string'
        ? JSON.parse(translation.optionsJson)
        : translation.optionsJson;

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([id, value]) => {
        if (value && typeof value === 'object') {
          return {
            id,
            text: value.text || '',
            images: value.images || [],
          };
        }

        return {
          id,
          text: typeof value === 'string' ? value : String(value ?? ''),
          images: [],
        };
      });
    }

    return [];
  } catch {
    return [];
  }
}

function typeLabel(type) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label || String(type || '').replaceAll('_', ' ');
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function AnswerBlock({ icon: Icon, title, tone = 'emerald', children }) {
  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    slate: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200',
    amber: 'border-amber-200 bg-amber-50/70 text-slate-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-slate-200',
  };
  const iconTones = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    slate: 'text-slate-500 dark:text-slate-400',
    amber: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${iconTones[tone]}`}>
        <Icon size={14} /> {title}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function QuestionPreviewContent({ question }) {
  const translations = question?.translations || [];
  const [lang, setLang] = useState(translations[0]?.language);

  const active =
    translations.find((translation) => translation.language === lang) ||
    translations[0];

  const options = useMemo(() => parseOptions(active), [active]);
  const correct = question?.correctAnswerJson || {};

  if (!question) return null;

  const activeLang = lang || translations[0]?.language;
  const hasMarks = hasValue(question.positiveMarks);

  return (
    <div className="space-y-5">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={QUESTION_TYPE_BADGE_STYLES[question.questionType]}>{typeLabel(question.questionType)}</Badge>
        {question.difficulty && (
          <Badge className={DIFFICULTY_BADGE_STYLES[question.difficulty]}>{question.difficulty}</Badge>
        )}
        {hasMarks && (
          <Badge tone="neutral">
            <Hash size={11} />+{question.positiveMarks}
            {Number(question.negativeMarks) > 0 ? ` / −${question.negativeMarks}` : ''} marks
          </Badge>
        )}
        {question.topic && (
          <Badge tone="neutral">
            <Tag size={11} /> {question.topic}
          </Badge>
        )}

        {translations.length > 1 && (
          <div className="ml-auto inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {translations.map((translation) => (
              <button
                key={translation.language}
                type="button"
                aria-pressed={activeLang === translation.language}
                onClick={() => setLang(translation.language)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                  activeLang === translation.language
                    ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {translation.language}
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (active.questionText || options.length > 0) ? (
        <>
          {/* Question */}
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              Q
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <MathText
                text={active.questionText || 'Question text will appear here…'}
                className="text-[15px] font-medium leading-relaxed text-slate-900 dark:text-white"
              />
              <QuestionImages images={active.questionImages || []} className="mt-3" />
            </div>
          </div>

          {/* Options */}
          {options.length > 0 && (
            <div className="space-y-2">
              {options.map((option, index) => {
                const isCorrect =
                  correct.correctOptionId === option.id ||
                  (correct.correctOptionIds || []).includes(option.id) ||
                  correct.key === option.id ||
                  (correct.keys || []).includes(option.id);

                return (
                  <div
                    key={option.id || index}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isCorrect ? <Check size={13} strokeWidth={3} /> : String.fromCharCode(65 + index)}
                      </span>

                      <div className="min-w-0 flex-1 pt-0.5 text-slate-800 dark:text-slate-200">
                        {option.text ? <MathText text={option.text} /> : <span className="italic text-slate-400 dark:text-slate-500">Empty option</span>}
                      </div>

                      {isCorrect && (
                        <span className="shrink-0 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          Correct
                        </span>
                      )}
                    </div>

                    <QuestionImages
                      images={option.images || active.optionImages?.[option.id] || []}
                      className="mt-3 pl-9"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {question.questionType === 'NUMERICAL' && hasValue(correct.value) && (
            <AnswerBlock icon={Check} title="Correct value">
              <strong className="text-base">{correct.value}</strong>
              {correct.tolerance ? <span className="ml-1 opacity-80">(± {correct.tolerance})</span> : null}
            </AnswerBlock>
          )}

          {question.questionType === 'SUBJECTIVE' && correct.modelAnswer && (
            <AnswerBlock icon={FileText} title="Model answer" tone="slate">
              <MathText text={correct.modelAnswer} />
            </AnswerBlock>
          )}

          {(question.explanation || question.explanationImages?.length > 0) && (
            <AnswerBlock icon={Lightbulb} title="Explanation" tone="amber">
              {question.explanation && <MathText text={question.explanation} className="leading-relaxed" />}
              <QuestionImages images={question.explanationImages || []} className="mt-3" />
            </AnswerBlock>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center dark:border-slate-700">
          <p className="text-sm text-slate-400 dark:text-slate-500">Nothing to preview yet — add question text first.</p>
        </div>
      )}
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-11/12" />
      <Skeleton className="h-5 w-2/3" />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-11 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Centered dialog showing how a question renders to students. */
export function QuestionPreviewModal({ open, onClose, question, onEdit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Question preview"
      description="How this question renders to students, with the correct answer highlighted."
      width="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onEdit && (
            <Button onClick={onEdit} disabled={!question}>
              <Pencil size={15} className="mr-2" /> Edit question
            </Button>
          )}
        </>
      }
    >
      {question ? <QuestionPreviewContent key={question.id} question={question} /> : <PreviewSkeleton />}
    </Modal>
  );
}
