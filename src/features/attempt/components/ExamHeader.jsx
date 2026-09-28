'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setSubmitModalOpen } from '../store/attemptSlice';
import ExamTimer from './ExamTimer';

export default function ExamHeader() {
  const dispatch = useAppDispatch();
  const attempt = useAppSelector(state => state.attempt.attempt);
  const connection = useAppSelector(state => state.attempt.ui.connection);

  const getStatusDot = () => {
    switch (connection) {
      case 'connected': return 'bg-emerald-500';
      case 'connecting': return 'bg-amber-500 animate-pulse';
      case 'offline': return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <header className="h-[56px] border-b border-exam-border bg-exam-panel flex items-center justify-between px-4 shrink-0 w-full z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl tracking-tight text-exam-accent">PrepHub</div>
        <div className="h-6 w-px bg-exam-border hidden sm:block"></div>
        <div className="hidden sm:flex flex-col">
          <span className="text-[13px] font-semibold text-exam-text line-clamp-1">{attempt?.title || 'Loading Test...'}</span>
          <span className="text-[11px] text-exam-text-muted px-1.5 py-0.5 bg-exam-bg rounded inline-block w-fit mt-0.5 uppercase tracking-wider">{attempt?.type || 'Test'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} title={`Status: ${connection}`}></div>
          <span className="text-xs text-exam-text-muted hidden sm:inline capitalize">{connection}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-exam-text-muted uppercase tracking-widest font-semibold">Time Left</span>
          <ExamTimer />
        </div>
        
        <button 
          onClick={() => dispatch(setSubmitModalOpen(true))}
          className="bg-exam-accent hover:bg-exam-accent/90 text-white text-sm font-semibold h-9 px-4 rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-exam-accent focus:ring-offset-1"
        >
          Submit Test
        </button>
      </div>
    </header>
  );
}
