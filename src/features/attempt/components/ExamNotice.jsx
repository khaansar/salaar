'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { clearExamNotice } from '../store/attemptSlice';

/** Inline, dismissible notice shown under the exam header. */
export default function ExamNotice() {
  const dispatch = useAppDispatch();
  const notice = useAppSelector((state) => state.attempt.ui.notice);

  if (!notice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
      <p className="flex-1 leading-5">{notice.message}</p>
      <button
        type="button"
        onClick={() => dispatch(clearExamNotice())}
        aria-label="Dismiss notice"
        className="rounded p-0.5 text-amber-700 hover:bg-amber-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
