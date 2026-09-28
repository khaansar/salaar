'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setCurrentQuestion } from '../store/attemptSlice';
import { makeSelectPaletteCounts } from '../store/selectors';
import { useMemo } from 'react';

// Reusable legend item
function LegendItem({ label, className, shape = 'square' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-exam-text-muted font-medium">
      <div className={`shrink-0 w-6 h-6 flex items-center justify-center font-bold text-[10px] ${className} ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}>
        0
      </div>
      <span className="leading-tight">{label}</span>
    </div>
  );
}

// Question Button logic
function QuestionButton({ qId, index, currentId, response, onClick }) {
  const isCurrent = qId === currentId;
  const isVisited = response?.visited;
  const isAnswered = response?.selected || (response?.numeric !== undefined && response?.numeric !== '');
  const isMarked = response?.marked;

  let baseClass = 'bg-white border-slate-300 text-slate-500 rounded-sm'; // default Not Visited
  if (isVisited) {
    if (isAnswered && isMarked) {
      baseClass = 'bg-exam-accent border-exam-accent text-white rounded-full'; // Answered & Marked
    } else if (isMarked) {
      baseClass = 'bg-amber-100 border-amber-400 text-amber-800 rounded-full'; // Marked
    } else if (isAnswered) {
      baseClass = 'bg-emerald-500 border-emerald-500 text-white rounded-sm'; // Answered
    } else {
      // Not Answered (visited, no answer) - clipped corner look (or just orange for now)
      baseClass = 'bg-rose-50 border-rose-300 text-rose-600 rounded-sm shadow-[inset_0_-8px_0_rgba(251,113,133,0.2)]';
    }
  }

  return (
    <button
      onClick={() => onClick(qId)}
      className={`
        w-10 h-10 flex items-center justify-center font-bold text-sm border transition-all relative
        ${baseClass}
        ${isCurrent ? 'ring-2 ring-exam-accent ring-offset-1' : 'hover:opacity-80'}
      `}
      aria-label={`Question ${index}`}
      aria-current={isCurrent}
    >
      {index}
    </button>
  );
}

export default function Palette() {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.attempt.sections);
  const currentSectionId = useAppSelector(state => state.attempt.ui.currentSectionId);
  const currentQuestionId = useAppSelector(state => state.attempt.ui.currentQuestionId);
  const responses = useAppSelector(state => state.attempt.responses);

  const handleJump = (qId) => {
    dispatch(setCurrentQuestion(qId));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* User Info (Fake for now) */}
      <div className="p-4 border-b border-exam-border bg-exam-panel flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-200 rounded text-slate-500 flex items-center justify-center overflow-hidden shrink-0">
          <svg className="w-8 h-8 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        <div>
          <div className="text-sm font-bold text-exam-text">Student Name</div>
          <div className="text-xs text-exam-text-muted">ID: 1029384</div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-b border-exam-border bg-white grid grid-cols-2 gap-y-3 gap-x-2">
        <LegendItem label="Not Visited" className="bg-white border-slate-300 text-slate-500" />
        <LegendItem label="Not Answered" className="bg-rose-50 border-rose-300 text-rose-600 shadow-[inset_0_-6px_0_rgba(251,113,133,0.2)]" />
        <LegendItem label="Answered" className="bg-emerald-500 border-emerald-500 text-white" />
        <LegendItem label="Marked" className="bg-amber-100 border-amber-400 text-amber-800" shape="circle" />
        <LegendItem label="Ans & Marked" className="bg-exam-accent border-exam-accent text-white" shape="circle" />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections.map(section => {
          const isExpanded = section.id === currentSectionId;
          if (!isExpanded) {
            return (
              <div key={section.id} className="mb-4">
                <button 
                  onClick={() => dispatch(setCurrentQuestion(section.questionIds[0]))}
                  className="w-full text-left font-semibold text-sm text-exam-text-muted hover:text-exam-text flex items-center justify-between p-2 bg-white rounded border border-exam-border"
                >
                  {section.name}
                  <span className="text-xs font-bold text-exam-accent bg-exam-accent-light px-2 py-0.5 rounded">
                    Expand
                  </span>
                </button>
              </div>
            );
          }

          return (
            <div key={section.id} className="mb-6">
              <h3 className="font-bold text-sm text-exam-text mb-3 px-1">{section.name}</h3>
              <div className="grid grid-cols-5 gap-2">
                {section.questionIds?.map((qId, idx) => (
                  <QuestionButton 
                    key={qId}
                    qId={qId}
                    index={idx + 1}
                    currentId={currentQuestionId}
                    response={responses[qId]}
                    onClick={handleJump}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
