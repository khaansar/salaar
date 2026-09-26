'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, X, Pencil, Check, Shuffle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AttachQuestionsDrawer } from './AttachQuestionsDrawer';
import { BulkCreateQuestionsModal } from './BulkCreateQuestionsModal';
import { MathText } from '@/components/common/MathText';
import { sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { QUESTION_TYPE_BADGE_STYLES } from '@/constants/enums';

function MarksEditor({ question, sectionId, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [pos, setPos] = useState(question.positiveMarks);
  const [neg, setNeg] = useState(question.negativeMarks);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!editing) {
    return (
      <button
        onClick={() => {
          setPos(question.positiveMarks);
          setNeg(question.negativeMarks);
          setEditing(true);
        }}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
      >
        +{question.positiveMarks} / -{question.negativeMarks || 0}
        <Pencil size={11} />
      </button>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      await sectionsApi.updateQuestionMarks(sectionId, question.questionId, {
        positiveMarksOverride: Number(pos),
        negativeMarksOverride: Number(neg),
      });
      toast.success('Marks updated');
      setEditing(false);
      onSaved?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to update marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        step="0.5"
        value={pos}
        onChange={(e) => setPos(e.target.value)}
        className="w-14 h-7 text-xs rounded border border-slate-300 px-1.5"
      />
      <input
        type="number"
        step="0.5"
        value={neg}
        onChange={(e) => setNeg(e.target.value)}
        className="w-14 h-7 text-xs rounded border border-slate-300 px-1.5"
      />
      <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-800">
        <Check size={14} />
      </button>
      <button onClick={() => setEditing(false)} disabled={saving} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </div>
  );
}

export function SectionCard({ section, testId, isFirst, isLast, onMoveUp, onMoveDown, onChanged }) {
  const toast = useToast();
  const [attachOpen, setAttachOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const questions = section.questions || [];
  const totalMarks = questions.reduce((sum, q) => sum + (q.positiveMarks || 0), 0);

  const moveQuestion = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    setReordering(true);
    try {
      await sectionsApi.reorderQuestions(section.sectionId, next.map((q) => q.questionId));
      onChanged?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to reorder questions');
    } finally {
      setReordering(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await sectionsApi.removeQuestion(section.sectionId, removeTarget.questionId);
      toast.success('Question removed from section');
      setRemoveTarget(null);
      onChanged?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove question');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-slate-50/60 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col -my-1">
            <button onClick={onMoveUp} disabled={isFirst} className="text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:pointer-events-none">
              <ChevronUp size={16} />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:pointer-events-none">
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{section.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {section.durationMinutes} min
              </span>
              {section.shuffleQuestions && (
                <span className="inline-flex items-center gap-1">
                  <Shuffle size={12} /> Shuffled
                </span>
              )}
              <span>
                {questions.length} question{questions.length !== 1 ? 's' : ''} · {totalMarks} marks
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Pencil size={14} className="mr-1.5" />
            Create questions
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAttachOpen(true)}>
            <Plus size={14} className="mr-1.5" />
            Attach questions
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-400">No questions in this section yet.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {questions.map((q, i) => (
            <div key={q.questionId} className="flex items-start gap-3 px-5 py-3">
              <div className="flex flex-col -my-0.5 pt-0.5">
                <button onClick={() => moveQuestion(i, -1)} disabled={i === 0 || reordering} className="text-slate-300 hover:text-slate-600 disabled:opacity-25">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1 || reordering} className="text-slate-300 hover:text-slate-600 disabled:opacity-25">
                  <ChevronDown size={14} />
                </button>
              </div>
              <span className="text-xs font-semibold text-slate-400 w-5 pt-0.5 shrink-0">{i + 1}.</span>
              <div className="min-w-0 flex-1">
                <MathText text={q.translations?.[0]?.questionText} className="text-sm text-slate-800 line-clamp-2" />
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge className={QUESTION_TYPE_BADGE_STYLES[q.questionType]}>{q.questionType}</Badge>
                  <MarksEditor question={q} sectionId={section.sectionId} onSaved={onChanged} />
                </div>
              </div>
              <button onClick={() => setRemoveTarget(q)} className="text-slate-300 hover:text-rose-600 shrink-0 mt-0.5">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <BulkCreateQuestionsModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        sectionId={section.sectionId}
        onCreated={onChanged}
      />

      <AttachQuestionsDrawer
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        sectionId={section.sectionId}
        existingQuestionIds={questions.map((q) => q.questionId)}
        onAttached={onChanged}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        isLoading={removing}
        title="Remove question from section?"
        description="The question stays in your question bank — this only removes it from this section."
        confirmLabel="Remove"
      />
    </div>
  );
}
