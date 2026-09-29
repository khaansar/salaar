'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setAttemptData } from '../store/attemptSlice';
import { useGetAttemptStateQuery } from '../store/attemptApi';
import ExamHeader from './ExamHeader';
import SectionTabs from './SectionTabs';
import QuestionPanel from './QuestionPanel';
import Palette from './Palette';
import ActionBar from './ActionBar';
import SubmitSummaryModal from './SubmitSummaryModal';

import { useAttemptStream } from '../hooks/useAttemptStream';
import { useAutosave } from '../hooks/useAutosave';

export default function ExamShell({ attemptId }) {
  const dispatch = useAppDispatch();

  // RTK Query handles deduplication, caching, and loading state automatically!
  const { data, error, isLoading } = useGetAttemptStateQuery(attemptId);

  useEffect(() => {
    if (data) {
      dispatch(setAttemptData(data));
    }
  }, [data, dispatch]);

  useAttemptStream(attemptId, !!data);
  useAutosave(attemptId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-exam-bg text-exam-primary">
        Loading your exam...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-exam-bg p-6">
        <div className="w-full max-w-md rounded-xl border border-exam-border bg-exam-panel p-6 text-center">
          <h2 className="text-lg font-bold text-exam-text">
            Unable to load test
          </h2>
          <p className="mt-2 text-sm text-exam-text-muted">
            We could not load this attempt. Please refresh
            the page and try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 bg-exam-accent text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans tabular-nums text-[17px] leading-[1.6]">
      <ExamHeader />

      <SectionTabs />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto flex flex-col bg-exam-bg relative">
          <QuestionPanel />
        </main>

        <aside className="w-[300px] border-l border-exam-border bg-exam-panel flex flex-col shrink-0 hidden lg:flex shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
          <Palette />
        </aside>
      </div>

      <footer className="h-[64px] border-t border-exam-border bg-exam-panel flex items-center justify-between px-4 sm:px-6 shrink-0 w-full z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ActionBar />
      </footer>

      <SubmitSummaryModal
        attemptId={attemptId}
      />
    </div>
  );
}