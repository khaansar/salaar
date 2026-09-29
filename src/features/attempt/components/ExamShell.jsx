'use client';

import { useEffect, useState } from 'react';

import { useAppDispatch } from '../../../hooks/useAppDispatch';

import {
  setAttemptData,
  setConnectionState,
  resetAttemptState,
} from '../store/attemptSlice';

import { attemptService } from '../../../services/attemptService';

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

  const [loadState, setLoadState] =
    useState('loading');

  const [attemptLoaded, setAttemptLoaded] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAttempt() {
      if (!attemptId) {
        setLoadState('error');
        return;
      }

      dispatch(resetAttemptState());
      setLoadState('loading');

      try {
        const data =
          await attemptService.getAttemptState(
            attemptId
          );

        if (cancelled) {
          return;
        }

        dispatch(setAttemptData(data));

        setAttemptLoaded(true);
        setLoadState('success');
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load attempt',
          error
        );

        dispatch(setConnectionState('offline'));

        setAttemptLoaded(false);
        setLoadState('error');
      }
    }

    loadAttempt();

    return () => {
      cancelled = true;
    };
  }, [attemptId, dispatch]);

  useAttemptStream(
    attemptId,
    attemptLoaded
  );

  useAutosave(attemptId);

  if (loadState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-exam-bg">
        <div className="text-sm text-exam-text-muted">
          Loading test...
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
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