'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, X } from 'lucide-react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setAttemptData } from '../store/attemptSlice';
import { useGetAttemptStateQuery, useSubmitAttemptMutation } from '../store/attemptApi';
import ExamHeader from './ExamHeader';
import SectionTabs from './SectionTabs';
import QuestionPanel from './QuestionPanel';
import Palette from './Palette';
import ActionBar from './ActionBar';
import SubmitSummaryModal from './SubmitSummaryModal';
import SectionSubmitModal from './SectionSubmitModal';

import { useAttemptStream } from '../hooks/useAttemptStream';
import { useAutosave } from '../hooks/useAutosave';

export default function ExamShell({ attemptId }) {
  const dispatch = useAppDispatch();

  // RTK Query handles deduplication, caching, and loading state automatically!
  const { data, error, isLoading } = useGetAttemptStateQuery(attemptId);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (data) {
      dispatch(setAttemptData(data));
    }
  }, [data, dispatch]);

  const isExpired = useAppSelector(state => state.attempt.ui.isExpired);
  useAttemptStream(attemptId, !!data);
  const { flush } = useAutosave(attemptId);
  const [submitAttempt] = useSubmitAttemptMutation();

  useEffect(() => {
    if (isExpired) {
      // Execute the autosubmit flow
      (async () => {
        try {
          if (flush) {
            try {
              await flush();
            } catch (autosaveErr) {
              console.warn('Ignoring autosave error during auto-submit:', autosaveErr);
            }
          }
          await submitAttempt(attemptId).unwrap();
          window.location.href = `/attempt/${attemptId}/result`;
        } catch (err) {
          console.error(err);
          // Go to result page anyway if it's already expired or errored
          window.location.href = `/attempt/${attemptId}/result`;
        }
      })();
    }
  }, [isExpired, attemptId, flush, submitAttempt]);

  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Initial check (in case they load the page directly not in fullscreen)
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Could not request fullscreen:', err);
      });
    }
  };

  // Anti-cheat: Disable right-click, copy, PrintScreen, and DevTools
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('Screenshots are disabled during the examination.').catch(() => {});
        return;
      }
      
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+C (and Mac equivalents)
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
        (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 67)) || 
        (e.metaKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
        (e.metaKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 67))
      ) {
        e.preventDefault();
      }
    };
    
    const handleCopy = (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'Copying is disabled during the examination.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

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
    <div className="flex flex-col h-screen overflow-hidden font-sans tabular-nums text-[17px] leading-[1.6] select-none">
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-exam-bg/90 backdrop-blur-sm">
          <div className="bg-exam-panel border border-exam-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold text-red-600 mb-3">Fullscreen Required</h2>
            <p className="text-exam-text-muted mb-6">
              You have exited fullscreen mode. This exam must be taken in fullscreen to prevent cheating. Please return to fullscreen to continue.
            </p>
            <button
              onClick={requestFullscreen}
              className="w-full bg-exam-accent hover:bg-exam-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      <ExamHeader />

      <SectionTabs />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto flex flex-col bg-exam-bg relative">
          <QuestionPanel />

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open question palette"
            className="lg:hidden sticky bottom-4 z-20 mt-auto ml-auto mr-4 mb-4 flex h-12 shrink-0 items-center gap-2 rounded-full bg-exam-accent px-4 text-sm font-semibold text-white shadow-lg"
          >
            <LayoutGrid className="h-4 w-4" />
            Questions
          </button>
        </main>

        <aside className="w-[300px] border-l border-exam-border bg-exam-panel flex flex-col shrink-0 hidden lg:flex shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
          <Palette />
        </aside>
      </div>

      {paletteOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close question palette"
            onClick={() => setPaletteOpen(false)}
            className="absolute inset-0 bg-slate-900/50"
          />

          <div className="absolute inset-y-0 right-0 flex w-[min(320px,90vw)] flex-col bg-exam-panel shadow-2xl">
            <button
              type="button"
              aria-label="Close question palette"
              onClick={() => setPaletteOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <Palette />
          </div>
        </div>
      )}

      <footer className="h-[64px] border-t border-exam-border bg-exam-panel flex items-center justify-between px-4 sm:px-6 shrink-0 w-full z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ActionBar />
      </footer>

      <SubmitSummaryModal
        attemptId={attemptId}
        flushAutosave={flush}
      />
      <SectionSubmitModal
        attemptId={attemptId}
        flushAutosave={flush}
      />
    </div>
  );
}