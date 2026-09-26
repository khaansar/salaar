'use client';
import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { MathText } from '@/components/common/MathText';
import { QUESTION_TYPE_BADGE_STYLES } from '@/constants/enums';

function parseOptions(t) {
  if (!t?.optionsJson) return [];
  try {
    const parsed = typeof t.optionsJson === 'string' ? JSON.parse(t.optionsJson) : t.optionsJson;
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([id, text]) => ({ id, text: typeof text === 'string' ? text : String(text ?? '') }));
    }
    return [];
  } catch {
    return [];
  }
}

export function QuestionPreviewDrawer({ open, onClose, question }) {
  const translations = question?.translations || [];
  const [lang, setLang] = useState(translations[0]?.language);

  // Render-phase state sync for external props (replaces useEffect reset)
  const defaultLang = translations[0]?.language;
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevId, setPrevId] = useState(question?.id);

  if (open !== prevOpen || question?.id !== prevId) {
    setPrevOpen(open);
    setPrevId(question?.id);
    if (open) {
      setLang(defaultLang);
    }
  }

  const active = translations.find((t) => t.language === lang) || translations[0];
  const options = useMemo(() => parseOptions(active), [active]);
  const correct = question?.correctAnswerJson || {};

  if (!question) return null;

  return (
    <Drawer open={open} onClose={onClose} title="Question preview" description="This is how the question will render to students." width="lg">
      <div className="flex items-center gap-2 mb-5">
        <Badge className={QUESTION_TYPE_BADGE_STYLES[question.questionType]}>{question.questionType}</Badge>
        {translations.length > 1 &&
          translations.map((t) => (
            <button
              key={t.language}
              onClick={() => setLang(t.language)}
              className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full transition-colors ${
                (lang || translations[0].language) === t.language
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.language}
            </button>
          ))}
      </div>
      {active ? (
        <>
          <div className="prose prose-sm max-w-none text-slate-900 font-medium mb-5">
            <MathText text={active.questionText} />
          </div>
          {options.length > 0 && (
            <div className="space-y-2 mb-6">
              {options.map((opt, i) => {
                const isCorrect = correct.correctOptionId === opt.id || (correct.correctOptionIds || []).includes(opt.id);
                return (
                  <div key={opt.id || i} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                    <span className="font-semibold text-slate-400 w-5 shrink-0">{String.fromCharCode(65 + i)}</span>
                    <div className="flex-1 text-slate-800"><MathText text={opt.text} /></div>
                    {isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
                  </div>
                );
              })}
            </div>
          )}
          {question.questionType === 'NUMERICAL' && correct.value !== undefined && (
            <div className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              Correct value: <strong>{correct.value}</strong> {correct.tolerance ? ` (± ${correct.tolerance})` : ''}
            </div>
          )}
          {question.questionType === 'SUBJECTIVE' && correct.modelAnswer && (
            <div className="mb-6 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Model answer</p>
              <MathText text={correct.modelAnswer} className="text-slate-700" />
            </div>
          )}
          {question.explanation && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Explanation</p>
              <MathText text={question.explanation} className="text-sm text-slate-700" />
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400">Nothing to preview yet   add question text first.</p>
      )}
    </Drawer>
  );
}