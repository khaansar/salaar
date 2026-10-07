'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setCurrentQuestion, clearAnswer, toggleMarkForReview, setSubmitModalOpen, setTargetSectionId, setSectionSubmitModalOpen, setCurrentSection } from '../store/attemptSlice';
import { ChevronLeft, ChevronRight, Bookmark, XCircle } from 'lucide-react';
import { useSwitchSectionMutation } from '../store/attemptApi';

export default function ActionBar() {
  const dispatch = useAppDispatch();
  const currentQuestionId = useAppSelector(state => state.attempt.ui.currentQuestionId);
  const sections = useAppSelector(state => state.attempt.sections);
  const isMarked = useAppSelector(state => state.attempt.responses[currentQuestionId]?.marked);

  const attempt = useAppSelector(state => state.attempt.attempt);
  const [switchSection] = useSwitchSectionMutation();
  
  const currentSectionId = useAppSelector(state => state.attempt.ui.currentSectionId);
  const currentSection = sections.find(s => s.id === currentSectionId);
  const flatQIds = currentSection?.questionIds || [];
  const currentIndex = flatQIds.indexOf(currentQuestionId);
  
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < flatQIds.length - 1;
  const isLastSection = sections.findIndex(s => s.id === currentSectionId) === sections.length - 1;
  const isLastQuestionOverall = isLastSection && !hasNext;

  const handleNext = () => {
    if (hasNext) {
      dispatch(setCurrentQuestion(flatQIds[currentIndex + 1]));
    } else if (!isLastSection) {
      // Find the next available section
      const currIdx = sections.findIndex(s => s.id === currentSectionId);
      const nextSection = sections.find((s, idx) => {
        if (idx <= currIdx) return false;
        if (!s.questionIds?.length) return false;
        let isExpired = false;
        if (s.durationMinutes) {
          const spent = attempt?.sectionTimeSpentSec?.[s.id] || 0;
          if (spent >= s.durationMinutes * 60) {
            isExpired = true;
          }
        }
        return !isExpired;
      });
      
      if (nextSection) {
        if (currentSection.durationMinutes) {
          dispatch(setTargetSectionId(nextSection.id));
          dispatch(setSectionSubmitModalOpen(true));
        } else {
          dispatch(setCurrentSection(nextSection.id));
          if (attempt?.id) {
            switchSection({ attemptId: attempt.id, sectionId: nextSection.id, submitCurrent: false })
              .unwrap()
              .then((res) => {
                 if (res) {
                   dispatch({ type: 'attempt/updateSectionTiming', payload: {
                     currentSectionStartedAt: res.currentSectionStartedAt,
                     sectionTimeSpentSec: res.sectionTimeSpentSec,
                   }});
                 }
              }).catch(console.error);
          }
        }
      } else {
        dispatch(setSubmitModalOpen(true));
      }
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      dispatch(setCurrentQuestion(flatQIds[currentIndex - 1]));
    }
  };

  const handleClear = () => {
    dispatch(clearAnswer(currentQuestionId));
  };

  const handleMark = () => {
    dispatch(toggleMarkForReview(currentQuestionId));
    handleNext(); // Usually moves to next
  };

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          type="button"
          aria-label="Previous question"
          onClick={handlePrev}
          disabled={!hasPrev}
          className="h-10 px-3 sm:px-4 border border-exam-border bg-white text-exam-text font-semibold rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button 
          type="button"
          onClick={handleClear}
          className="h-10 px-3 sm:px-4 bg-white border border-slate-200 text-slate-600 font-semibold rounded hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <XCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Response</span>
          <span className="sm:hidden">Clear</span>
        </button>

        <button 
          type="button"
          onClick={handleMark}
          className={`h-10 px-3 sm:px-4 border font-semibold rounded transition-colors flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
            isMarked 
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isMarked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{isMarked ? 'Unmark & Next' : 'Mark for Review & Next'}</span>
          <span className="sm:hidden">Mark</span>
        </button>

        <button 
          type="button"
          onClick={isLastQuestionOverall ? () => dispatch(setSubmitModalOpen(true)) : handleNext}
          className="h-10 px-3 sm:px-6 bg-exam-accent hover:bg-exam-accent/90 text-white font-semibold rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-exam-accent flex items-center gap-2"
        >
          {isLastQuestionOverall ? 'Review & Submit' : (!hasNext ? 'Submit Section' : 'Save & Next')}
          {!isLastQuestionOverall && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
