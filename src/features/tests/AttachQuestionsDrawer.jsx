'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, CheckSquare, Square, Lock } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { questionsApi, sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { QUESTION_TYPE_OPTIONS, QUESTION_TYPE_BADGE_STYLES, DIFFICULTY_BADGE_STYLES } from '@/constants/enums';

const PAGE_SIZE = 10;

export function AttachQuestionsDrawer({ open, onClose, sectionId, existingQuestionIds = [], onAttached }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [posOverride, setPosOverride] = useState('');
  const [negOverride, setNegOverride] = useState('');
  const [attaching, setAttaching] = useState(false);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (open) {
      setSearch('');
      setType('');
      setPage(1);
      setSelected([]);
      setPosOverride('');
      setNegOverride('');
    }
  }, [open]);

  const loadQuestions = useMemo(
    () => () => {
      if (!open) return;
      setLoading(true);
      setError(null);
      questionsApi
        .list({ search: debouncedSearch, type, page, limit: PAGE_SIZE })
        .then((res) => {
          setItems(res.items);
          setMeta(res.meta);
        })
        .catch((err) => setError(err?.message || 'Failed to load questions'))
        .finally(() => setLoading(false));
    },
    [open, debouncedSearch, type, page]
  );

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const refetch = loadQuestions;

  const alreadyAttached = new Set(existingQuestionIds);

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleAttach = async () => {
    if (selected.length === 0) return;
    setAttaching(true);
    try {
      const payload = { questionIds: selected };
      if (posOverride !== '') payload.positiveMarksOverride = Number(posOverride);
      if (negOverride !== '') payload.negativeMarksOverride = Number(negOverride);
      await sectionsApi.attachQuestions(sectionId, payload);
      toast.success(`${selected.length} question${selected.length > 1 ? 's' : ''} attached`);
      onAttached?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to attach questions');
    } finally {
      setAttaching(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Attach questions"
      description="Select questions from your bank to add to this section."
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={attaching}>
            Cancel
          </Button>
          <Button onClick={handleAttach} isLoading={attaching} disabled={selected.length === 0}>
            Attach {selected.length > 0 ? `(${selected.length})` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="w-48">
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              placeholder="All types"
            >
              {QUESTION_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <Input
            label="Marks override (optional)"
            type="number"
            step="0.5"
            placeholder="Use question default"
            value={posOverride}
            onChange={(e) => setPosOverride(e.target.value)}
          />
          <Input
            label="Negative marks override (optional)"
            type="number"
            step="0.5"
            placeholder="Use question default"
            value={negOverride}
            onChange={(e) => setNegOverride(e.target.value)}
          />
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {loading && <TableSkeleton rows={5} cols={1} />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && items.length === 0 && <EmptyState title="No questions found" description="Try a different search." />}
          {!loading &&
            !error &&
            items.map((q) => {
              const attached = alreadyAttached.has(q.id);
              const isSelected = selected.includes(q.id);
              return (
                <button
                  type="button"
                  key={q.id}
                  disabled={attached}
                  onClick={() => toggle(q.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-0 transition-colors ${
                    attached ? 'bg-slate-50 opacity-60 cursor-not-allowed' : isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square size={18} className="text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 truncate">{q.shortText}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge className={QUESTION_TYPE_BADGE_STYLES[q.questionType]}>{q.questionType}</Badge>
                      <Badge className={DIFFICULTY_BADGE_STYLES[q.difficulty]}>{q.difficulty}</Badge>
                      {attached && <span className="text-xs text-slate-400 inline-flex items-center gap-1"><Lock size={11} /> Already in section</span>}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {meta?.pagination && (
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <button
              disabled={!meta.pagination.has_previous}
              onClick={() => setPage((p) => p - 1)}
              className="disabled:opacity-30 hover:text-indigo-600"
            >
              Previous
            </button>
            <span>
              Page {meta.pagination.current_page} of {meta.pagination.total_pages || 1}
            </span>
            <button
              disabled={!meta.pagination.has_next}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:opacity-30 hover:text-indigo-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
