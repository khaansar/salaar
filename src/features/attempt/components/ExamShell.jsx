'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setAttemptData, setConnectionState } from '../store/attemptSlice';
import { MOCK_ATTEMPT_DATA } from '../mock/mockAttempt';
import { attemptService } from '../../../services/attemptService';
import ExamHeader from './ExamHeader';
import SectionTabs from './SectionTabs';
import QuestionPanel from './QuestionPanel';
import Palette from './Palette';
import ActionBar from './ActionBar';
import { useAttemptStream } from '../hooks/useAttemptStream';
import { useAutosave } from '../hooks/useAutosave';
import SubmitSummaryModal from './SubmitSummaryModal';

export default function ExamShell({ attemptId }) {
  const dispatch = useAppDispatch();
  useAttemptStream(attemptId);
  useAutosave(attemptId);

  useEffect(() => {
    async function loadAttempt() {
      try {
        const data = await attemptService.getAttemptState(attemptId);
        dispatch(setAttemptData(data));
      } catch (err) {
        console.error('Failed to load attempt', err);
        // Handle error (e.g. redirect to history)
      }
    }
    loadAttempt();
  }, [dispatch, attemptId]);

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
      <SubmitSummaryModal attemptId={attemptId} />
    </div>
  );
}
