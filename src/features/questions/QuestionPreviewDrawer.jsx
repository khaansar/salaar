'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { MathText } from '@/components/common/MathText';
import { QuestionImages } from '@/components/common/QuestionImages';
import { QUESTION_TYPE_BADGE_STYLES } from '@/constants/enums';

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

export function QuestionPreviewContent({ question }) {
  const translations = question?.translations || [];
  const [lang, setLang] = useState(translations[0]?.language);

  const active =
    translations.find((translation) => translation.language === lang) ||
    translations[0];

  const options = useMemo(() => parseOptions(active), [active]);
  const correct = question?.correctAnswerJson || {};

  if (!question) return null;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge className={QUESTION_TYPE_BADGE_STYLES[question.questionType]}>
          {question.questionType}
        </Badge>

        {translations.length > 1 &&
          translations.map((translation) => (
            <button
              key={translation.language}
              type="button"
              onClick={() => setLang(translation.language)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                (lang || translations[0].language) === translation.language
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {translation.language}
            </button>
          ))}
      </div>

      {active && (active.questionText || options.length > 0) ? (
        <>
          <div className="prose prose-sm mb-4 max-w-none font-medium text-slate-900">
            <MathText
              text={active.questionText || 'Question text will appear here…'}
            />
          </div>

          <QuestionImages
            images={active.questionImages || []}
            className="mb-6"
          />

          {options.length > 0 && (
            <div className="mb-6 space-y-3">
              {options.map((option, index) => {
                const isCorrect =
                  correct.correctOptionId === option.id ||
                  (correct.correctOptionIds || []).includes(option.id) ||
                  correct.key === option.id ||
                  (correct.keys || []).includes(option.id);

                return (
                  <div
                    key={option.id || index}
                    className={`rounded-lg border px-3 py-2.5 text-sm ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-5 shrink-0 font-semibold text-slate-400">
                        {String.fromCharCode(65 + index)}
                      </span>

                      <div className="min-w-0 flex-1 text-slate-800">
                        <MathText text={option.text} />
                      </div>

                      {isCorrect && (
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                      )}
                    </div>

                    <QuestionImages
                      images={
                        option.images ||
                        active.optionImages?.[option.id] ||
                        []
                      }
                      className="mt-3 pl-8"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {question.questionType === 'NUMERICAL' &&
            correct.value !== undefined &&
            correct.value !== '' && (
              <div className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                Correct value: <strong>{correct.value}</strong>
                {correct.tolerance ? ` (± ${correct.tolerance})` : ''}
              </div>
            )}

          {question.questionType === 'SUBJECTIVE' && correct.modelAnswer && (
            <div className="mb-6 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                Model answer
              </p>
              <MathText
                text={correct.modelAnswer}
                className="text-slate-700"
              />
            </div>
          )}

          {(question.explanation || question.explanationImages?.length > 0) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Explanation
              </p>

              {question.explanation && (
                <MathText
                  text={question.explanation}
                  className="text-sm text-slate-700"
                />
              )}

              <QuestionImages
                images={question.explanationImages || []}
                className="mt-3"
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400">
          Nothing to preview yet — add question text first.
        </p>
      )}
    </>
  );
}

export function QuestionPreviewDrawer({ open, onClose, question }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Question preview"
      description="This is how the question will render to students."
      width="lg"
    >
      <QuestionPreviewContent question={question} />
    </Drawer>
  );
}