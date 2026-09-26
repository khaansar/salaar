'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Eye, AlertTriangle, Save } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { OptionsEditor, newOptionId } from './OptionsEditor';
import { CorrectAnswerEditor } from './CorrectAnswerEditor';
import { QuestionPreviewDrawer } from './QuestionPreviewDrawer';
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
  const [previewOpen, setPreviewOpen] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-24">
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

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Question details</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Question type" value={form.questionType} onChange={(e) => setQuestionType(e.target.value)}>
              {QUESTION_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Content &amp; translations</h2>
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-100 pb-4">
            {form.translations.map((t) => (
              <button
                type="button"
                key={t.language}
                onClick={() => setActiveLang(t.language)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
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
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                >
                  <Plus size={12} /> Add language
                </button>
                <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
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
            )}
          </div>

          {activeTranslation && (
            <div className="space-y-4">
              <Textarea
                label="Question text"
                placeholder="Use $...$ for inline math and $$...$$ for block math, e.g. $x^2 + y^2 = z^2$"
                rows={4}
                value={activeTranslation.questionText}
                onChange={(e) => updateTranslation(activeTranslation.language, { questionText: e.target.value })}
                error={errors[`text_${activeTranslation.language}`]}
              />
              {withOptions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Options</label>
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
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Correct answer</h2>
        </CardHeader>
        <CardBody>
          <CorrectAnswerEditor
            questionType={form.questionType}
            options={withOptions ? primaryTranslation.options : []}
            value={form.correctAnswerJson}
            onChange={handleCorrectAnswerChange}
          />
          {errors.correctAnswer && <p className="mt-2 text-xs text-red-500">{errors.correctAnswer}</p>}
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Explanation</h2>
        </CardHeader>
        <CardBody>
          <Textarea
            placeholder="Shown to students after they attempt the question. Supports $...$ math."
            value={form.explanation}
            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          />
        </CardBody>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 z-20">
        <Button type="button" variant="outline" onClick={() => router.push('/admin-dashboard/questions')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save size={16} className="mr-2" />
          {isEdit ? 'Save changes' : 'Create question'}
        </Button>
      </div>

      <QuestionPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        question={{
          questionType: form.questionType,
          translations: form.translations.map((t) => ({
            language: t.language,
            questionText: t.questionText,
            optionsJson: withOptions ? JSON.stringify(Object.fromEntries(t.options.map((o) => [o.id, o.text]))) : undefined,
          })),
          correctAnswerJson: form.correctAnswerJson,
          explanation: form.explanation,
        }}
      />
    </form>
  );
}