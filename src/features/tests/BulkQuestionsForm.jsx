'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ClipboardPaste, AlertCircle, CheckCircle2, Save, ListPlus, Sparkles, Copy, Check } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { OptionsEditor, newOptionId } from '@/features/questions/OptionsEditor';
import { CorrectAnswerEditor } from '@/features/questions/CorrectAnswerEditor';
import { MathTextarea } from '@/features/questions/MathTextarea';
import { questionsApi, sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS, QUESTION_TYPE_BADGE_STYLES } from '@/constants/enums';

const HAS_OPTIONS = (type) => type === 'MCQ' || type === 'MULTI_CORRECT';

function newBlock() {
  return {
    key: newOptionId(),
    questionType: 'MCQ',
    difficulty: 'MEDIUM',
    positiveMarks: 1,
    negativeMarks: 0,
    questionText: '',
    options: [{ id: newOptionId(), text: '' }, { id: newOptionId(), text: '' }],
    correctAnswerJson: {},
    explanation: '',
  };
}

// Client-side convenience only — the API has no bulk/CSV import endpoint.
// Expected format, one question per line, pipe-separated:
//   Question text | Option A | Option B | Option C | Option D | CorrectLetter | Marks
// "Marks" is optional (defaults to 1). Only produces MCQ questions.
function parsePastedRows(raw) {
  const blocks = [];
  const skipped = [];
  raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length < 6) {
        skipped.push(line);
        return;
      }
      const [text, a, b, c, d, correctLetter, marks] = parts;
      const options = [
        { id: newOptionId(), text: a || '' },
        { id: newOptionId(), text: b || '' },
        { id: newOptionId(), text: c || '' },
        { id: newOptionId(), text: d || '' },
      ].filter((o) => o.text);
      const correctIndex = 'ABCD'.indexOf((correctLetter || '').toUpperCase());
      if (!text || options.length < 2 || correctIndex === -1 || correctIndex >= options.length) {
        skipped.push(line);
        return;
      }
      blocks.push({
        key: newOptionId(),
        questionType: 'MCQ',
        difficulty: 'MEDIUM',
        positiveMarks: marks ? Number(marks) || 1 : 1,
        negativeMarks: 0,
        questionText: text,
        options,
        correctAnswerJson: { key: options[correctIndex].id, correctOptionId: options[correctIndex].id },
        explanation: '',
      });
    });
  return { blocks, skipped };
}

// Prompt admins can paste into an AI assistant (with their questions) so the
// output matches what `parsePastedRows` accepts.
const AI_FORMAT_PROMPT = `Convert the questions below into plain text for bulk upload.

Output ONLY the converted lines: one question per line, in exactly this format:
Question text | Option A | Option B | Option C | Option D | Correct letter | Marks

Rules:
- Exactly 4 options per question.
- Correct letter is a single letter: A, B, C or D.
- Marks is a number; use 1 if not given.
- Never use the | character or line breaks inside a question or option.
- Write math in LaTeX between $...$, e.g. $x^2 + 1$.
- No numbering, headings, blank lines, code blocks or explanations.

Questions:
[paste your questions here]`;

function CopyPromptCard() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AI_FORMAT_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the prompt stays visible for manual copy.
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-200">
          <Sparkles size={13} /> Format questions with AI
        </p>
        <Button type="button" variant="outline" size="sm" onClick={copy} className="h-7 bg-white px-2.5 text-xs dark:bg-slate-900">
          {copied ? <Check size={13} className="mr-1 text-emerald-600" /> : <Copy size={13} className="mr-1" />}
          {copied ? 'Copied' : 'Copy prompt'}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-indigo-900/80 dark:text-indigo-200/80">
        Copy this prompt into ChatGPT, Claude or Gemini, replace the last line with your questions, then paste the result below.
      </p>
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-indigo-100 bg-white px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-700 dark:border-indigo-500/20 dark:bg-slate-900 dark:text-slate-300">
        {AI_FORMAT_PROMPT}
      </pre>
    </div>
  );
}

export function BulkQuestionsForm({ testId, sectionId, sectionTitle }) {
  const router = useRouter();
  const toast = useToast();
  const [blocks, setBlocks] = useState([newBlock()]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteWarning, setPasteWarning] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(null);

  const updateBlock = (key, patch) => setBlocks((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const removeBlock = (key) => setBlocks((bs) => (bs.length > 1 ? bs.filter((b) => b.key !== key) : bs));
  const addBlock = () => setBlocks((bs) => [...bs, newBlock()]);

  const setBlockType = (key, type) =>
    updateBlock(key, {
      questionType: type,
      correctAnswerJson: {},
      options: HAS_OPTIONS(type) ? [{ id: newOptionId(), text: '' }, { id: newOptionId(), text: '' }] : [],
    });

  const applyPastedRows = () => {
    const { blocks: parsed, skipped } = parsePastedRows(pasteText);
    if (parsed.length === 0) {
      setPasteWarning('No valid rows found. Check the format shown below.');
      return;
    }
    setBlocks(parsed);
    setPasteWarning(
      skipped.length > 0
        ? `Loaded ${parsed.length} question(s). Skipped ${skipped.length} row(s) that didn't match the format.`
        : null
    );
    setPasteMode(false);
    setPasteText('');
  };

  const validate = () => {
    const next = {};
    blocks.forEach((b) => {
      if (!b.questionText.trim()) next[`text_${b.key}`] = 'Required';
      if (HAS_OPTIONS(b.questionType)) {
        const filled = b.options.filter((o) => o.text.trim());
        if (filled.length < 2) next[`options_${b.key}`] = 'Add at least 2 options';
        if (b.questionType === 'MCQ' && !b.correctAnswerJson.correctOptionId) next[`answer_${b.key}`] = 'Select correct option';
        if (b.questionType === 'MULTI_CORRECT' && !(b.correctAnswerJson.correctOptionIds || []).length)
          next[`answer_${b.key}`] = 'Select correct option(s)';
      }
      if (b.questionType === 'NUMERICAL' && (b.correctAnswerJson.value === undefined || b.correctAnswerJson.value === ''))
        next[`answer_${b.key}`] = 'Enter correct value';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted questions');
      return;
    }
    setSubmitting(true);
    setProgress({ index: 1, total: blocks.length, label: 'Uploading bulk...' });

    const payload = blocks.map((b) => ({
      questionType: b.questionType,
      difficulty: b.difficulty,
      positiveMarks: Number(b.positiveMarks) || 0,
      negativeMarks: Number(b.negativeMarks) || 0,
      explanation: b.explanation,
      translations: [
        {
          language: 'en',
          questionText: b.questionText,
          ...(HAS_OPTIONS(b.questionType)
            ? { optionsJson: JSON.stringify(Object.fromEntries(b.options.map((o) => [o.id, o.text]))) }
            : {}),
        },
      ],
      correctAnswerJson: b.correctAnswerJson,
    }));

    try {
      const result = await questionsApi.bulkCreate(payload);
      const { imported, failed, errors, createdIds } = result;
      setProgress(null);

      if (createdIds && createdIds.length > 0) {
        try {
          await sectionsApi.attachQuestions(sectionId, { questionIds: createdIds });
        } catch (err) {
          toast.error(`Created ${createdIds.length} question(s) but failed to attach them: ${err?.message || 'unknown error'}`);
          setSubmitting(false);
          router.push(`/admin-dashboard/tests/${testId}`);
          return;
        }
      }

      if (!failed) {
        toast.success(`Created and added ${imported} question${imported !== 1 ? 's' : ''}`);
        setSubmitting(false);
        router.push(`/admin-dashboard/tests/${testId}`);
      } else {
        toast.error(`${imported} succeeded, ${failed} failed (see error in row ${errors?.[0]?.row}: ${errors?.[0]?.reason})`);
        setSubmitting(false);
        // Keep only the failed rows on the page for the admin to retry.
        const failedRows = new Set((errors || []).map((e) => e.row - 1));
        setBlocks((bs) => bs.filter((_, i) => failedRows.has(i)));
      }
    } catch (err) {
      toast.error(`Bulk import failed: ${err?.message || 'unknown error'}`);
      setSubmitting(false);
      setProgress(null);
    }
  };

  const typeLabel = (type) => QUESTION_TYPE_OPTIONS.find((o) => o.value === type)?.label || type;
  const blockHasError = (key) => Object.keys(errors).some((errorKey) => errorKey.endsWith(`_${key}`));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Intro + paste tool */}
      <Card>
        <CardBody className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <ListPlus size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Adding to <span className="text-indigo-600 dark:text-indigo-400">{sectionTitle}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Questions are created in your question bank and added to this section in one go.
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setPasteMode((v) => !v)} className="shrink-0 self-start sm:self-center">
              <ClipboardPaste size={14} className="mr-1.5" />
              {pasteMode ? 'Hide paste tool' : 'Paste multiple MCQs'}
            </Button>
          </div>

          {pasteMode && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <CopyPromptCard />
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">One question per line, pipe-separated:</p>
              <code className="mb-3 block overflow-x-auto whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Question text | Option A | Option B | Option C | Option D | Correct letter (A–D) | Marks (optional)
              </code>
              <Textarea
                rows={5}
                placeholder={'Capital of France? | Paris | London | Rome | Berlin | A | 1\nWhich planet is red? | Mercury | Venus | Mars | Jupiter | C'}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              {pasteWarning && (
                <p className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle size={12} /> {pasteWarning}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Loading replaces the questions below.</p>
                <Button type="button" size="sm" onClick={applyPastedRows}>
                  Load into form
                </Button>
              </div>
            </div>
          )}

          {!pasteMode && pasteWarning && (
            <p className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={12} /> {pasteWarning}
            </p>
          )}
        </CardBody>
      </Card>

      {/* Question blocks */}
      {blocks.map((b, i) => (
        <Card key={b.key} className={blockHasError(b.key) ? 'border-rose-300 dark:border-rose-500/40' : ''}>
          <CardHeader className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Question {i + 1}</span>
              <Badge className={QUESTION_TYPE_BADGE_STYLES[b.questionType]}>{typeLabel(b.questionType)}</Badge>
            </div>
            <button
              type="button"
              onClick={() => removeBlock(b.key)}
              disabled={blocks.length <= 1}
              title="Remove question"
              aria-label={`Remove question ${i + 1}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <Trash2 size={15} />
            </button>
          </CardHeader>

          <CardBody className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Select id={`bulk-type-${b.key}`} label="Type" value={b.questionType} onChange={(e) => setBlockType(b.key, e.target.value)}>
                  {QUESTION_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Select id={`bulk-difficulty-${b.key}`} label="Difficulty" value={b.difficulty} onChange={(e) => updateBlock(b.key, { difficulty: e.target.value })}>
                {DIFFICULTY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Input
                id={`bulk-marks-${b.key}`}
                label="Marks"
                type="number"
                step="0.5"
                value={b.positiveMarks}
                onChange={(e) => updateBlock(b.key, { positiveMarks: e.target.value })}
              />
            </div>

            <MathTextarea
              id={`bulk-text-${b.key}`}
              label="Question text"
              rows={3}
              placeholder="Type the question. Use $...$ for inline math."
              value={b.questionText}
              onChange={(questionText) => updateBlock(b.key, { questionText })}
              error={errors[`text_${b.key}`]}
            />

            {HAS_OPTIONS(b.questionType) && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">Options</p>
                <OptionsEditor value={b.options} onChange={(options) => updateBlock(b.key, { options })} />
                {errors[`options_${b.key}`] && <p className="mt-1.5 text-xs text-red-500">{errors[`options_${b.key}`]}</p>}
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <CorrectAnswerEditor
                questionType={b.questionType}
                options={b.options}
                value={b.correctAnswerJson}
                onChange={(correctAnswerJson) => updateBlock(b.key, { correctAnswerJson })}
              />
              {errors[`answer_${b.key}`] && <p className="mt-2 text-xs text-red-500">{errors[`answer_${b.key}`]}</p>}
            </div>
          </CardBody>
        </Card>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
      >
        <Plus size={16} />
        Add another question
      </button>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{blocks.length}</span> question{blocks.length !== 1 ? 's' : ''} ready to create
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin-dashboard/tests/${testId}`)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting}>
            <Save size={16} className="mr-2" />
            {progress ? progress.label || 'Uploading...' : `Create ${blocks.length} question${blocks.length !== 1 ? 's' : ''} & add to section`}
          </Button>
        </div>
      </div>
    </form>
  );
}
