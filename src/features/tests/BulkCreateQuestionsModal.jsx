'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ClipboardPaste, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { OptionsEditor, newOptionId } from '@/features/questions/OptionsEditor';
import { CorrectAnswerEditor } from '@/features/questions/CorrectAnswerEditor';
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
        correctAnswerJson: { correctOptionId: options[correctIndex].id },
        explanation: '',
      });
    });
  return { blocks, skipped };
}

export function BulkCreateQuestionsModal({ open, onClose, sectionId, onCreated }) {
  const toast = useToast();
  const [blocks, setBlocks] = useState([newBlock()]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteWarning, setPasteWarning] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(null);

  const reset = () => {
    setBlocks([newBlock()]);
    setPasteMode(false);
    setPasteText('');
    setPasteWarning(null);
    setErrors({});
    setProgress(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const updateBlock = (key, patch) => setBlocks((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const removeBlock = (key) => setBlocks((bs) => (bs.length > 1 ? bs.filter((b) => b.key !== key) : bs));
  const addBlock = () => setBlocks((bs) => [...bs, newBlock()]);

  const setBlockType = (key, type) =>
    updateBlock(key, {
      questionType: type,
      correctAnswerJson: {},
      options: HAS_OPTIONS(type)
        ? [{ id: newOptionId(), text: '' }, { id: newOptionId(), text: '' }]
        : [],
    });

  const applyPastedRows = () => {
    const { blocks: parsed, skipped } = parsePastedRows(pasteText);
    if (parsed.length === 0) {
      setPasteWarning('No valid rows found. Check the format shown below.');
      return;
    }
    setBlocks(parsed);
    setPasteWarning(skipped.length > 0 ? `Loaded ${parsed.length} question(s). Skipped ${skipped.length} row(s) that didn't match the format.` : null);
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

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the highlighted questions');
      return;
    }
    setSubmitting(true);
    const createdIds = [];
    const failed = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      setProgress({ index: i + 1, total: blocks.length });
      try {
        const payload = {
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
        };
        const created = await questionsApi.create(payload);
        createdIds.push(created.id);
      } catch (err) {
        failed.push({ index: i + 1, message: err?.message });
      }
    }
    setProgress(null);

    if (createdIds.length > 0) {
      try {
        await sectionsApi.attachQuestions(sectionId, { questionIds: createdIds });
      } catch (err) {
        toast.error(`Created ${createdIds.length} question(s) but failed to attach them: ${err?.message || 'unknown error'}`);
        setSubmitting(false);
        onCreated?.();
        return;
      }
    }

    if (failed.length === 0) {
      toast.success(`Created and added ${createdIds.length} question${createdIds.length !== 1 ? 's' : ''}`);
      setSubmitting(false);
      reset();
      onCreated?.();
      onClose();
    } else {
      toast.error(`${createdIds.length} succeeded, ${failed.length} failed (see question ${failed[0].index}: ${failed[0].message || 'error'})`);
      setSubmitting(false);
      onCreated?.();
      // Keep only the failed blocks open for the admin to retry.
      const failedIndexes = new Set(failed.map((f) => f.index - 1));
      setBlocks((bs) => bs.filter((_, i) => failedIndexes.has(i)));
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Create questions"
      description="Type new questions here — they'll be created in your question bank and added to this section in one go."
      width="3xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting}>
            {progress ? `Creating ${progress.index} of ${progress.total}...` : `Create ${blocks.length} question${blocks.length !== 1 ? 's' : ''} & add to section`}
          </Button>
        </>
      }
    >
      <div className="mb-5 flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={() => setPasteMode((v) => !v)}>
          <ClipboardPaste size={14} className="mr-1.5" />
          {pasteMode ? 'Hide paste tool' : 'Paste multiple MCQs'}
        </Button>
        <span className="text-xs text-slate-400">Note: the API has no file/CSV import — this pastes into the form below.</span>
      </div>

      {pasteMode && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-2">
            One question per line, pipe-separated:
            <br />
            <code className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 mt-1 inline-block">
              Question text | Option A | Option B | Option C | Option D | Correct letter (A–D) | Marks (optional)
            </code>
          </p>
          <Textarea
            rows={5}
            placeholder={'Capital of France? | Paris | London | Rome | Berlin | A | 1\nWhich planet is red? | Mercury | Venus | Mars | Jupiter | C'}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          {pasteWarning && (
            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle size={12} /> {pasteWarning}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <Button type="button" size="sm" onClick={applyPastedRows}>
              Load into form
            </Button>
          </div>
        </div>
      )}

      {!pasteMode && pasteWarning && (
        <p className="mb-4 text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={12} /> {pasteWarning}
        </p>
      )}

      <div className="space-y-5">
        {blocks.map((b, i) => (
          <div key={b.key} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Question {i + 1}</span>
                <Badge className={QUESTION_TYPE_BADGE_STYLES[b.questionType]}>{b.questionType}</Badge>
              </div>
              <button
                type="button"
                onClick={() => removeBlock(b.key)}
                disabled={blocks.length <= 1}
                className="text-slate-300 hover:text-rose-600 disabled:opacity-25 disabled:pointer-events-none"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="col-span-2">
                <Select label="Type" value={b.questionType} onChange={(e) => setBlockType(b.key, e.target.value)}>
                  {QUESTION_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Select label="Difficulty" value={b.difficulty} onChange={(e) => updateBlock(b.key, { difficulty: e.target.value })}>
                {DIFFICULTY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Input
                label="Marks"
                type="number"
                step="0.5"
                value={b.positiveMarks}
                onChange={(e) => updateBlock(b.key, { positiveMarks: e.target.value })}
              />
            </div>

            <Textarea
              label="Question text"
              rows={2}
              placeholder="Use $...$ for inline math"
              value={b.questionText}
              onChange={(e) => updateBlock(b.key, { questionText: e.target.value })}
              error={errors[`text_${b.key}`]}
            />

            {HAS_OPTIONS(b.questionType) && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Options</label>
                <OptionsEditor value={b.options} onChange={(options) => updateBlock(b.key, { options })} />
                {errors[`options_${b.key}`] && <p className="mt-1.5 text-xs text-red-500">{errors[`options_${b.key}`]}</p>}
              </div>
            )}

            <div className="mt-3">
              <CorrectAnswerEditor
                questionType={b.questionType}
                options={b.options}
                value={b.correctAnswerJson}
                onChange={(correctAnswerJson) => updateBlock(b.key, { correctAnswerJson })}
              />
              {errors[`answer_${b.key}`] && <p className="mt-1.5 text-xs text-red-500">{errors[`answer_${b.key}`]}</p>}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addBlock} className="mt-4">
        <Plus size={14} className="mr-1.5" />
        Add another question
      </Button>
    </Drawer>
  );
}