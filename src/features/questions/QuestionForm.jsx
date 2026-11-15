'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  X,
  AlertTriangle,
  Save,
  Eye,
  ListPlus,
} from 'lucide-react';

import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

import { OptionsEditor, newOptionId } from './OptionsEditor';
import { CorrectAnswerEditor } from './CorrectAnswerEditor';
import { QuestionPreviewContent } from './QuestionPreview';
import { MathTextarea } from './MathTextarea';
import { QuestionImageEditor } from './QuestionImageEditor';

import { questionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import {
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  COMMON_LANGUAGES,
  QUESTION_TYPE_BADGE_STYLES,
} from '@/constants/enums';

const HAS_OPTIONS = (type) =>
  type === 'MCQ' || type === 'MULTI_CORRECT';

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image) => image && typeof image.url === 'string')
    .map((image, index) => ({
      url: image.url,
      publicId: image.publicId || '',
      altText: image.altText || '',
      caption: image.caption || '',
      sequence: Number.isInteger(image.sequence)
        ? image.sequence
        : index,
    }))
    .sort((a, b) => a.sequence - b.sequence);
}

function parseOptions(optionsJson, optionImages = {}) {
  if (!optionsJson) return [];

  let parsed;

  try {
    parsed =
      typeof optionsJson === 'string'
        ? JSON.parse(optionsJson)
        : optionsJson;
  } catch {
    return [];
  }

  let options = [];

  if (Array.isArray(parsed)) {
    options = parsed.map((option) => ({
      id: option.id || newOptionId(),
      text: option.text || '',
    }));
  } else if (parsed && typeof parsed === 'object') {
    options = Object.entries(parsed).map(([id, value]) => ({
      id,
      text:
        typeof value === 'string'
          ? value
          : String(value ?? ''),
    }));
  }

  return options.map((option) => ({
    ...option,
    images: normalizeImages(optionImages?.[option.id]),
  }));
}

function emptyTranslation(language, withOptions) {
  return {
    language,
    questionText: '',
    questionImages: [],
    options: withOptions
      ? [
          { id: newOptionId(), text: '', images: [] },
          { id: newOptionId(), text: '', images: [] },
        ]
      : [],
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
      explanationImages: [],
      translations: [emptyTranslation('en', true)],
      correctAnswerJson: {},
    };
  }

  const withOptions = HAS_OPTIONS(question.questionType);
  const answerState = { ...(question.correctAnswerJson || {}) };

  if (question.questionType === 'MCQ') {
    const mappedKey =
      answerState.key || answerState.correctOptionId;

    answerState.key = mappedKey;
    answerState.correctOptionId = mappedKey;
  } else if (question.questionType === 'MULTI_CORRECT') {
    const mappedKeys =
      answerState.keys || answerState.correctOptionIds || [];

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
    explanationImages: normalizeImages(question.explanationImages),
    translations: (question.translations || []).map((translation) => ({
      language: translation.language,
      questionText: translation.questionText || '',
      questionImages: normalizeImages(translation.questionImages),
      options: withOptions
        ? parseOptions(
            translation.optionsJson,
            translation.optionImages
          )
        : [],
    })),
    correctAnswerJson: answerState,
  };
}

/**
 * Keep the backend optionImages contract separate from optionsJson.
 *
 * optionsJson remains { optionId: "option text" }.
 * optionImages becomes { optionId: [image metadata, ...] }.
 */
function buildOptionImages(options) {
  return Object.fromEntries(
    options
      .filter((option) => Array.isArray(option.images) && option.images.length)
      .map((option) => [
        option.id,
        normalizeImages(option.images).map((image, sequence) => ({
          ...image,
          sequence,
        })),
      ])
  );
}

function buildOptionsJson(options) {
  return JSON.stringify(
    Object.fromEntries(
      options.map((option) => [option.id, option.text || ''])
    )
  );
}

export function QuestionForm({ question }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(question);

  const [form, setForm] = useState(() => initFromQuestion(question));
  const [activeLang, setActiveLang] = useState(
    form.translations[0]?.language || 'en'
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const activeTranslation =
    form.translations.find(
      (translation) => translation.language === activeLang
    ) || form.translations[0];

  const primaryTranslation = form.translations[0];
  const withOptions = HAS_OPTIONS(form.questionType);

  const availableLanguages = useMemo(
    () =>
      COMMON_LANGUAGES.filter(
        (language) =>
          !form.translations.some(
            (translation) => translation.language === language.value
          )
      ),
    [form.translations]
  );

  const updateTranslation = (language, patch) => {
    setForm((current) => ({
      ...current,
      translations: current.translations.map((translation) =>
        translation.language === language
          ? { ...translation, ...patch }
          : translation
      ),
    }));
  };

  const setQuestionType = (type) => {
    setForm((current) => ({
      ...current,
      questionType: type,
      correctAnswerJson: {},
      translations: current.translations.map((translation) => ({
        ...translation,
        options: HAS_OPTIONS(type)
          ? translation.options.length
            ? translation.options
            : [
                { id: newOptionId(), text: '', images: [] },
                { id: newOptionId(), text: '', images: [] },
              ]
          : [],
      })),
    }));
  };

  const addLanguage = (code) => {
    if (
      !code ||
      form.translations.some(
        (translation) => translation.language === code
      )
    ) {
      return;
    }

    const copiedOptions = withOptions
      ? primaryTranslation.options.map((option) => ({
          id: option.id,
          text: '',
          images: [],
        }))
      : [];

    setForm((current) => ({
      ...current,
      translations: [
        ...current.translations,
        {
          language: code,
          questionText: '',
          questionImages: [],
          options: copiedOptions,
        },
      ],
    }));

    setActiveLang(code);
  };

  const removeLanguage = (code) => {
    if (form.translations.length <= 1) return;

    const remaining = form.translations.filter(
      (translation) => translation.language !== code
    );

    setForm((current) => ({
      ...current,
      translations: remaining,
    }));

    if (activeLang === code) {
      setActiveLang(remaining[0].language);
    }
  };

  const validate = () => {
    const nextErrors = {};

    form.translations.forEach((translation) => {
      if (!translation.questionText.trim()) {
        nextErrors[`text_${translation.language}`] =
          'Question text is required';
      }

      if (withOptions) {
        const filled = translation.options.filter((option) =>
          option.text.trim()
        );

        if (filled.length < 2) {
          nextErrors[`options_${translation.language}`] =
            'Add at least 2 non-empty options';
        }
      }
    });

    if (withOptions && form.questionType === 'MCQ') {
      const hasCorrectOption =
        form.correctAnswerJson.key ||
        form.correctAnswerJson.correctOptionId;

      if (!hasCorrectOption) {
        nextErrors.correctAnswer = 'Select the correct option';
      }
    }

    if (withOptions && form.questionType === 'MULTI_CORRECT') {
      const correctOptions =
        form.correctAnswerJson.keys ||
        form.correctAnswerJson.correctOptionIds ||
        [];

      if (!correctOptions.length) {
        nextErrors.correctAnswer =
          'Select at least one correct option';
      }
    }

    if (
      form.questionType === 'NUMERICAL' &&
      (form.correctAnswerJson.value === undefined ||
        form.correctAnswerJson.value === '')
    ) {
      nextErrors.correctAnswer =
        'Enter the correct numerical value';
    }

    if (
      form.positiveMarks === '' ||
      Number.isNaN(Number(form.positiveMarks))
    ) {
      nextErrors.positiveMarks = 'Required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCorrectAnswerChange = (incomingJson) => {
    const nextAnswer = { ...incomingJson };

    if (nextAnswer.correctOptionId) {
      nextAnswer.key = nextAnswer.correctOptionId;
    }

    if (nextAnswer.key) {
      nextAnswer.correctOptionId = nextAnswer.key;
    }

    if (nextAnswer.correctOptionIds) {
      nextAnswer.keys = nextAnswer.correctOptionIds;
    }

    if (nextAnswer.keys) {
      nextAnswer.correctOptionIds = nextAnswer.keys;
    }

    setForm((current) => ({
      ...current,
      correctAnswerJson: nextAnswer,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSaving(true);

    try {
      const finalAnswer = { ...form.correctAnswerJson };

      if (form.questionType === 'MCQ') {
        finalAnswer.key =
          finalAnswer.key || finalAnswer.correctOptionId;

        delete finalAnswer.correctOptionId;
        delete finalAnswer.keys;
        delete finalAnswer.correctOptionIds;
      } else if (form.questionType === 'MULTI_CORRECT') {
        finalAnswer.keys =
          finalAnswer.keys || finalAnswer.correctOptionIds;

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
        explanationImages: normalizeImages(
          form.explanationImages
        ).map((image, sequence) => ({
          ...image,
          sequence,
        })),

        translations: form.translations.map((translation) => ({
          language: translation.language,
          questionText: translation.questionText,

          questionImages: normalizeImages(
            translation.questionImages
          ).map((image, sequence) => ({
            ...image,
            sequence,
          })),

          ...(withOptions
            ? {
                optionsJson: buildOptionsJson(
                  translation.options
                ),
                optionImages: buildOptionImages(
                  translation.options
                ),
              }
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
    } catch (error) {
      toast.error(error?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const previewQuestion = {
    questionType: form.questionType,
    difficulty: form.difficulty,
    positiveMarks: form.positiveMarks,
    negativeMarks: form.negativeMarks,
    topic: form.topic,
    translations: form.translations.map((translation) => ({
      language: translation.language,
      questionText: translation.questionText,
      questionImages: translation.questionImages,
      optionsJson: withOptions
        ? buildOptionsJson(translation.options)
        : undefined,
      optionImages: withOptions
        ? buildOptionImages(translation.options)
        : undefined,
    })),
    correctAnswerJson: form.correctAnswerJson,
    explanation: form.explanation,
    explanationImages: form.explanationImages,
  };

  const typeLabel =
    QUESTION_TYPE_OPTIONS.find((option) => option.value === form.questionType)?.label || form.questionType;
  const hasQuestionError = Object.keys(errors).some((key) => key !== 'positiveMarks');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Intro — same pattern as the bulk "Create questions" page */}
      <Card>
        <CardBody className="p-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <ListPlus size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {isEdit ? 'Editing a question in your ' : 'Adding to your '}
                <span className="text-indigo-600 dark:text-indigo-400">question bank</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Questions in the bank can be attached to any section of any mock test.
              </p>
            </div>
          </div>

          {question?.isLocked && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">This question is locked</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                  {question.warning ||
                    'It is used in one or more published tests. Edit with care — changes affect live tests.'}
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          {/* Question */}
          <Card className={hasQuestionError ? 'border-rose-300 dark:border-rose-500/40' : ''}>
            <CardHeader className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  1
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Question</span>
                <Badge className={QUESTION_TYPE_BADGE_STYLES[form.questionType]}>{typeLabel}</Badge>
              </div>
            </CardHeader>

            <CardBody className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Select
                    id="question-type"
                    label="Type"
                    value={form.questionType}
                    onChange={(event) =>
                      setQuestionType(event.target.value)
                    }
                  >
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <Select
                  id="question-difficulty"
                  label="Difficulty"
                  value={form.difficulty}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      difficulty: event.target.value,
                    }))
                  }
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Input
                  id="question-positive-marks"
                  label="Marks"
                  type="number"
                  step="0.5"
                  value={form.positiveMarks}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      positiveMarks: event.target.value,
                    }))
                  }
                  error={errors.positiveMarks}
                />
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">Languages</p>
                <div className="flex flex-wrap items-center gap-2">
                  {form.translations.map((translation) => {
                    const active = activeLang === translation.language;

                    return (
                      <div
                        key={translation.language}
                        className={`inline-flex items-center overflow-hidden rounded-full border text-xs font-semibold uppercase tracking-wide transition-colors ${
                          active
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => setActiveLang(translation.language)}
                          className="px-3 py-1.5"
                        >
                          {translation.language}
                        </button>

                        {form.translations.length > 1 && (
                          <button
                            type="button"
                            aria-label={`Remove ${translation.language} translation`}
                            onClick={() => removeLanguage(translation.language)}
                            className={`py-1.5 pl-0.5 pr-2 ${active ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {availableLanguages.length > 0 && (
                    <label className="relative inline-flex items-center">
                      <span className="sr-only">Add language</span>
                      <Plus size={12} className="pointer-events-none absolute left-2.5 text-slate-400" />
                      <select
                        value=""
                        onChange={(event) => addLanguage(event.target.value)}
                        className="h-[30px] cursor-pointer appearance-none rounded-full border border-dashed border-slate-300 bg-transparent pl-7 pr-3 text-xs font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:text-slate-400"
                      >
                        <option value="">Add language</option>
                        {availableLanguages.map((language) => (
                          <option key={language.value} value={language.value}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>

              {activeTranslation && (
                <>
                  <MathTextarea
                    id={`qtext-${activeTranslation.language}`}
                    label={`Question text${form.translations.length > 1 ? ` (${activeTranslation.language.toUpperCase()})` : ''}`}
                    rows={3}
                    placeholder="Type the question. Use $...$ for inline math."
                    value={activeTranslation.questionText}
                    onChange={(text) =>
                      updateTranslation(activeTranslation.language, {
                        questionText: text,
                      })
                    }
                    error={errors[`text_${activeTranslation.language}`]}
                  />

                  <QuestionImageEditor
                    title="Question images"
                    description="Images and diagrams shown alongside the question text."
                    images={activeTranslation.questionImages}
                    disabled={saving}
                    onChange={(questionImages) =>
                      updateTranslation(activeTranslation.language, {
                        questionImages,
                      })
                    }
                  />
                </>
              )}

              {withOptions && activeTranslation && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">
                    Options{form.translations.length > 1 ? ` (${activeTranslation.language.toUpperCase()})` : ''}
                  </p>
                  <OptionsEditor
                    value={activeTranslation.options}
                    onChange={(options) =>
                      updateTranslation(activeTranslation.language, {
                        options,
                      })
                    }
                    disabled={saving}
                  />

                  {errors[`options_${activeTranslation.language}`] && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors[`options_${activeTranslation.language}`]}
                    </p>
                  )}

                  {activeTranslation.language !==
                    primaryTranslation.language && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Correct answer is set from the{' '}
                      <strong className="uppercase">
                        {primaryTranslation.language}
                      </strong>{' '}
                      options — keep option IDs consistent across languages.
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                <CorrectAnswerEditor
                  questionType={form.questionType}
                  options={withOptions ? primaryTranslation.options : []}
                  value={form.correctAnswerJson}
                  onChange={handleCorrectAnswerChange}
                />

                {errors.correctAnswer && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.correctAnswer}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Explanation & grading */}
          <Card>
            <CardHeader className="flex items-center gap-2.5 px-5 py-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Explanation &amp; grading</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Optional</span>
            </CardHeader>

            <CardBody className="space-y-5 p-5">
              <MathTextarea
                id="explanation"
                label="Explanation"
                rows={3}
                placeholder="Explain the solution step by step. Shown to students after they submit."
                value={form.explanation}
                onChange={(explanation) =>
                  setForm((current) => ({
                    ...current,
                    explanation,
                  }))
                }
              />

              <QuestionImageEditor
                title="Explanation images"
                description="Solution diagrams, worked examples, or other explanation figures."
                images={form.explanationImages}
                disabled={saving}
                onChange={(explanationImages) =>
                  setForm((current) => ({
                    ...current,
                    explanationImages,
                  }))
                }
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Input
                  id="question-negative-marks"
                  label="Negative marks"
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.negativeMarks}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      negativeMarks: event.target.value,
                    }))
                  }
                />

                <div className="sm:col-span-3">
                  <Input
                    id="question-topic"
                    label="Topic / Concept"
                    placeholder="e.g. Algebra, Trigonometry, Blood Relations"
                    value={form.topic}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        topic: event.target.value,
                      }))
                    }
                    helpText="Used for topic-level analytics and student weakness diagnosis."
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Live preview */}
        <div className="xl:sticky xl:top-4">
          <Card>
            <CardHeader className="flex items-center gap-2.5 px-5 py-3.5">
              <Eye size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Live preview</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">As students see it</span>
            </CardHeader>

            <CardBody className="max-h-[70vh] overflow-y-auto p-5">
              <QuestionPreviewContent question={previewQuestion} />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEdit ? 'Changes apply wherever this question is used.' : 'The question will be saved to your question bank.'}
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin-dashboard/questions')}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button type="submit" isLoading={saving}>
            <Save size={16} className="mr-2" />
            {isEdit ? 'Save changes' : 'Create question'}
          </Button>
        </div>
      </div>
    </form>
  );
}
