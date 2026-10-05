'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, AlertTriangle, Save, HelpCircle, ListChecks, Lightbulb, Tag } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { OptionsEditor, newOptionId } from './OptionsEditor';
import { CorrectAnswerEditor } from './CorrectAnswerEditor';
import { QuestionPreviewContent } from './QuestionPreviewDrawer';
import { MathTextarea } from './MathTextarea';
import { questionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS, COMMON_LANGUAGES } from '@/constants/enums';

const HAS_OPTIONS = (type) => type === 'MCQ' || type === 'MULTI_CORRECT';

function parseOptions(optionsJson) {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) {
      return parsed.map((o) => ({ id: o.id || newOptionId(), text: o.text || '' }));
    }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([id, text]) => ({ id, text: typeof text === 'string' ? text : String(text ?? '') }));
    }
    return [];
  } catch {
    return [];
  }
}

function emptyTranslation(language, withOptions) {
  return {
    language,
    questionText: '',
    options: withOptions ? [{ id: newOptionId(), text: '' }, { id: newOptionId(), text: '' }] : [],
  };
}

function initFromQuestion(question) {
  if (!question) {
    return {
      questionType: 'MCQ',
      difficulty: 'MEDIUM',
      topic: '',
      positiveMarks: 1,
      negativeMarks: 0,
      explanation: '',
      translations: [emptyTranslation('en', true)],
      correctAnswerJson: {},
    };
  }
  
  const withOptions = HAS_OPTIONS(question.questionType);
  const answerState = { ...(question.correctAnswerJson || {}) };

  // Defensively bind both keys so the frontend cannot fail
  if (question.questionType === 'MCQ') {
    const mappedKey = answerState.key || answerState.correctOptionId;
    answerState.key = mappedKey;
    answerState.correctOptionId = mappedKey;
  } else if (question.questionType === 'MULTI_CORRECT') {
    const mappedKeys = answerState.keys || answerState.correctOptionIds || [];
    answerState.keys = mappedKeys;
    answerState.correctOptionIds = mappedKeys;
  }

  return {
    questionType: question.questionType || 'MCQ',
    difficulty: question.difficulty || 'MEDIUM',
    topic: question.topic || '',
    positiveMarks: question.positiveMarks ?? 1,
    negativeMarks: question.negativeMarks ?? 0,
    explanation: question.explanation || '',
    translations: (question.translations || []).map((t) => ({
      language: t.language,
      questionText: t.questionText || '',
      options: withOptions ? parseOptions(t.optionsJson) : [],
    })),
    correctAnswerJson: answerState,
  };
}

export function QuestionForm({ question }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(question);

  const [form, setForm] = useState(() => initFromQuestion(question));
  const [activeLang, setActiveLang] = useState(form.translations[0]?.language || 'en');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const activeTranslation = form.translations.find((t) => t.language === activeLang) || form.translations[0];
  const primaryTranslation = form.translations[0];
  const withOptions = HAS_OPTIONS(form.questionType);

  const availableLanguages = useMemo(
    () => COMMON_LANGUAGES.filter((l) => !form.translations.some((t) => t.language === l.value)),
    [form.translations]
  );

  const updateTranslation = (language, patch) => {
    setForm((f) => ({
      ...f,
      translations: f.translations.map((t) => (t.language === language ? { ...t, ...patch } : t)),
    }));
  };

  const setQuestionType = (type) => {
    setForm((f) => ({
      ...f,
      questionType: type,
      correctAnswerJson: {},
      translations: f.translations.map((t) => ({
        ...t,
        options: HAS_OPTIONS(type) ? (t.options.length ? t.options : [{ id: newOptionId(), text: '' }, { id: newOptionId(), text: '' }]) : [],
      })),
    }));
  };

  const addLanguage = (code) => {
    if (!code || form.translations.some((t) => t.language === code)) return;
    const copyOptionsFromPrimary = withOptions
      ? primaryTranslation.options.map((o) => ({ id: o.id, text: '' }))
      : [];
    setForm((f) => ({
      ...f,
      translations: [...f.translations, { language: code, questionText: '', options: copyOptionsFromPrimary }],
    }));
    setActiveLang(code);
  };

  const removeLanguage = (code) => {
    if (form.translations.length <= 1) return;
    setForm((f) => ({ ...f, translations: f.translations.filter((t) => t.language !== code) }));
    if (activeLang === code) setActiveLang(form.translations[0].language === code ? form.translations[1]?.language : form.translations[0].language);
  };

  const validate = () => {
    const next = {};
    form.translations.forEach((t) => {
      if (!t.questionText.trim()) next[`text_${t.language}`] = 'Question text is required';
      if (withOptions) {
        const filled = t.options.filter((o) => o.text.trim());
        if (filled.length < 2) next[`options_${t.language}`] = 'Add at least 2 non-empty options';
      }
    });
    
    // Checks for either key format so UI validation doesn't falsely fail
    if (withOptions) {
      if (form.questionType === 'MCQ') {
        const hasKey = form.correctAnswerJson.key || form.correctAnswerJson.correctOptionId;
        if (!hasKey) next.correctAnswer = 'Select the correct option';
      }
      if (form.questionType === 'MULTI_CORRECT') {
        const arr = form.correctAnswerJson.keys || form.correctAnswerJson.correctOptionIds || [];
        if (!arr.length) next.correctAnswer = 'Select at least one correct option';
      }
    }
    if (form.questionType === 'NUMERICAL' && (form.correctAnswerJson.value === undefined || form.correctAnswerJson.value === '')) {
      next.correctAnswer = 'Enter the correct numerical value';
    }
    if (form.positiveMarks === '' || Number.isNaN(Number(form.positiveMarks))) next.positiveMarks = 'Required';
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Interceptor: Syncs both formats whenever the child component updates
  const handleCorrectAnswerChange = (incomingJson) => {
    const nextAnswer = { ...incomingJson };
    if (nextAnswer.correctOptionId) nextAnswer.key = nextAnswer.correctOptionId;
    if (nextAnswer.key) nextAnswer.correctOptionId = nextAnswer.key;
    
    if (nextAnswer.correctOptionIds) nextAnswer.keys = nextAnswer.correctOptionIds;
    if (nextAnswer.keys) nextAnswer.correctOptionIds = nextAnswer.keys;

    setForm((f) => ({ ...f, correctAnswerJson: nextAnswer }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    
    try {
      // Clean up payload so ONLY the Java-expected schema is sent
      const finalAnswer = { ...form.correctAnswerJson };
      if (form.questionType === 'MCQ') {
        finalAnswer.key = finalAnswer.key || finalAnswer.correctOptionId;
        delete finalAnswer.correctOptionId;
        delete finalAnswer.keys;
        delete finalAnswer.correctOptionIds;
      } else if (form.questionType === 'MULTI_CORRECT') {
        finalAnswer.keys = finalAnswer.keys || finalAnswer.correctOptionIds;
        delete finalAnswer.correctOptionId;
        delete finalAnswer.correctOptionIds;
        delete finalAnswer.key;
      }

      const payload = {
        questionType: form.questionType,
        difficulty: form.difficulty,
        topic: form.topic?.trim() || null,
        positiveMarks: Number(form.positiveMarks),
        negativeMarks: Number(form.negativeMarks || 0),
        explanation: form.explanation,
        translations: form.translations.map((t) => ({
          language: t.language,
          questionText: t.questionText,
          ...(withOptions
            ? { optionsJson: JSON.stringify(Object.fromEntries(t.options.map((o) => [o.id, o.text]))) }
            : {}),
        })),
        correctAnswerJson: finalAnswer,
      };

      if (isEdit) {
        await questionsApi.update(question.id, payload);
        toast.success('Question updated');
      } else {
        await questionsApi.create(payload);
        toast.success('Question created');
      }
      router.push('/admin-dashboard/questions');
    } catch (err) {
      toast.error(err?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };


  const STEPS = [
    { id: 'details', label: 'Question Details', hint: 'Content and basic settings', icon: HelpCircle },
    ...(withOptions ? [{ id: 'options', label: 'Options', hint: 'Add answer options', icon: ListChecks }] : [{ id: 'answer', label: 'Correct Answer', hint: 'Define the correct answer', icon: ListChecks }]),
    { id: 'explanation', label: 'Explanation', hint: 'Add solution and explanation', icon: Lightbulb },
    { id: 'metadata', label: 'Difficulty & Marks', hint: 'Classify and grade this question', icon: Tag },
  ];

  const previewQuestion = {
    questionType: form.questionType,
    topic: form.topic,
    translations: form.translations.map((t) => ({
      language: t.language,
      questionText: t.questionText,
      optionsJson: withOptions ? JSON.stringify(Object.fromEntries(t.options.map((o) => [o.id, o.text]))) : undefined,
    })),
    correctAnswerJson: form.correctAnswerJson,
    explanation: form.explanation,
  };

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      {question?.isLocked && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">This question is locked</p>
            <p className="mt-0.5 text-amber-700">
              {question.warning || 'It is used in one or more published tests. Edit with care — changes affect live tests.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_360px] gap-6 items-start">
        {/* Left: step anchors */}
        <div className="hidden lg:block sticky top-6 space-y-1">
          {STEPS.map((step, i) => (
            <a
              key={step.id}
              href={`#step-${step.id}`}
              className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-100 transition-colors group"
            >
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-indigo-700">{step.label}</span>
                <span className="block text-xs text-slate-500">{step.hint}</span>
              </span>
            </a>
          ))}
        </div>

        {/* Middle: form content */}
        <div className="space-y-6 min-w-0">
          <Card id="step-details">
            <CardHeader className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <HelpCircle size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Question Details</h2>
                <p className="text-sm text-slate-500 mt-0.5">Enter the question content and basic information.</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select label="Question type" value={form.questionType} onChange={(e) => setQuestionType(e.target.value)}>
                {QUESTION_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                {form.translations.map((t) => (
                  <button
                    type="button"
                    key={t.language}
                    onClick={() => setActiveLang(t.language)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors mt-3 ${
                      activeLang === t.language ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.language}
                    {form.translations.length > 1 && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLanguage(t.language);
                        }}
                        className={activeLang === t.language ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-600'}
                      >
                        <X size={12} />
                      </span>
                    )}
                  </button>
                ))}
                {availableLanguages.length > 0 && (
                  <div className="relative group mt-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                    >
                      <Plus size={12} /> Add language
                    </button>
                    <div className="absolute left-0 top-full z-10 hidden pt-1 group-hover:block group-focus-within:block">
                      <div className="flex min-w-[140px] flex-col rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        {availableLanguages.map((l) => (
                          <button
                            type="button"
                            key={l.value}
                            onClick={() => addLanguage(l.value)}
                            className="text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {activeTranslation && (
                <MathTextarea
                  id={`qtext-${activeTranslation.language}`}
                  label="Question Text"
                  rows={4}
                  placeholder="Use $...$ for inline math and $$...$$ for block math, e.g. $x^2 + y^2 = z^2$"
                  value={activeTranslation.questionText}
                  onChange={(text) => updateTranslation(activeTranslation.language, { questionText: text })}
                  error={errors[`text_${activeTranslation.language}`]}
                />
              )}
            </CardBody>
          </Card>

          <Card id={withOptions ? 'step-options' : 'step-answer'}>
            <CardHeader className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ListChecks size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{withOptions ? 'Options' : 'Correct Answer'}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {withOptions ? 'Add answer options and mark the correct one(s).' : 'Define the correct answer for this question.'}
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {withOptions && activeTranslation && (
                <div>
                  <OptionsEditor
                    value={activeTranslation.options}
                    onChange={(options) => updateTranslation(activeTranslation.language, { options })}
                  />
                  {errors[`options_${activeTranslation.language}`] && (
                    <p className="mt-1.5 text-xs text-red-500">{errors[`options_${activeTranslation.language}`]}</p>
                  )}
                  {activeTranslation.language !== primaryTranslation.language && (
                    <p className="mt-2 text-xs text-slate-400">
                      Correct answer is set from the <strong className="uppercase">{primaryTranslation.language}</strong> options — keep option order consistent across languages.
                    </p>
                  )}
                </div>
              )}
              <div className={withOptions ? 'pt-4 border-t border-slate-100' : ''}>
                {withOptions && <p className="text-sm font-medium text-slate-700 mb-2">Correct answer</p>}
                <CorrectAnswerEditor
                  questionType={form.questionType}
                  options={withOptions ? primaryTranslation.options : []}
                  value={form.correctAnswerJson}
                  onChange={handleCorrectAnswerChange}
                />
                {errors.correctAnswer && <p className="mt-2 text-xs text-red-500">{errors.correctAnswer}</p>}
              </div>
            </CardBody>
          </Card>

          <Card id="step-explanation">
            <CardHeader className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Lightbulb size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Explanation</h2>
                <p className="text-sm text-slate-500 mt-0.5">Shown to students after they submit the question.</p>
              </div>
            </CardHeader>
            <CardBody>
              <MathTextarea
                id="explanation"
                rows={4}
                placeholder="Explain the solution step by step. Supports $...$ math and images."
                value={form.explanation}
                onChange={(text) => setForm((f) => ({ ...f, explanation: text }))}
              />
            </CardBody>
          </Card>

          <Card id="step-metadata">
            <CardHeader className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Tag size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Difficulty &amp; Marks</h2>
                <p className="text-sm text-slate-500 mt-0.5">Classify and grade this question.</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Positive marks"
                  type="number"
                  step="0.5"
                  value={form.positiveMarks}
                  onChange={(e) => setForm((f) => ({ ...f, positiveMarks: e.target.value }))}
                  error={errors.positiveMarks}
                />
                <Input
                  label="Negative marks"
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.negativeMarks}
                  onChange={(e) => setForm((f) => ({ ...f, negativeMarks: e.target.value }))}
                />
              </div>

              <div>
                <Input
                  label="Topic / Concept"
                  placeholder="e.g. Algebra, Trigonometry, Blood Relations"
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                />
                <p className="mt-1 text-xs text-slate-400">Used for topic-level analytics and student weakness diagnosis.</p>
              </div>
            </CardBody>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/admin-dashboard/questions')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              <Save size={16} className="mr-2" />
              {isEdit ? 'Save changes' : 'Create question'}
            </Button>
          </div>
        </div>

        {/* Right: live preview + quick settings, sticky on desktop */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900">Question Preview</h2>
              <p className="text-sm text-slate-500 mt-0.5">This is how the question will appear to students.</p>
            </CardHeader>
            <CardBody>
              <QuestionPreviewContent question={previewQuestion} />
            </CardBody>
          </Card>
        </div>
      </div>
    </form>
  );
}