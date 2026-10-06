'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setSectionSubmitModalOpen, setCurrentSection, setTargetSectionId } from '../store/attemptSlice';
import { makeSelectPaletteCounts } from '../store/selectors';
import { useState, useMemo } from 'react';
import { useSwitchSectionMutation } from '../store/attemptApi';

export default function SectionSubmitModal({ attemptId, flushAutosave }) {
  const dispatch = useAppDispatch();
  const [switchSection] = useSwitchSectionMutation();
  
  const isOpen = useAppSelector(state => state.attempt.ui.sectionSubmitModalOpen);
  const targetSectionId = useAppSelector(state => state.attempt.ui.targetSectionId);
  const currentSectionId = useAppSelector(state => state.attempt.ui.currentSectionId);
  const sections = useAppSelector(state => state.attempt.sections);
  const attempt = useAppSelector(state => state.attempt.attempt);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive counts for current section only
  const selectPaletteCounts = useMemo(() => makeSelectPaletteCounts(), []);
  const sectionCounts = useAppSelector(state => selectPaletteCounts(state, currentSectionId));
  const currentSection = sections.find(s => s.id === currentSectionId);
  const targetSection = sections.find(s => s.id === targetSectionId);

  if (!isOpen || !currentSection) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (flushAutosave) {
         await flushAutosave();
      }
      if (attempt?.id && targetSectionId) {
        const res = await switchSection({ attemptId: attempt.id, sectionId: targetSectionId, submitCurrent: true }).unwrap();
        dispatch(setCurrentSection(targetSectionId));
        if (res?.data) {
          dispatch({ type: 'attempt/updateSectionTiming', payload: {
            currentSectionStartedAt: res.data.currentSectionStartedAt,
            sectionTimeSpentSec: res.data.sectionTimeSpentSec,
          }});
        }
      }
      dispatch(setSectionSubmitModalOpen(false));
      dispatch(setTargetSectionId(null));
    } catch (err) {
      console.error(err);
      alert('Failed to switch section. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    dispatch(setSectionSubmitModalOpen(false));
    dispatch(setTargetSectionId(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        role="dialog" 
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Submit Section: {currentSection.name}</h2>
          <button 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to submit this section and move to <strong>{targetSection?.name}</strong>? 
            <br/><span className="text-rose-600 font-semibold">Warning: You will not be able to return to this section once submitted.</span>
          </p>
          
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center text-emerald-600">Answered</th>
                  <th className="px-4 py-3 text-center text-amber-600">Marked</th>
                  <th className="px-4 py-3 text-center text-rose-600">Not Answered</th>
                  <th className="px-4 py-3 text-center text-slate-500">Not Visited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 text-center font-bold">
                    {currentSection.questionIds?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{sectionCounts.answered + sectionCounts.answeredAndMarked}</td>
                  <td className="px-4 py-3 text-center font-medium">{sectionCounts.markedForReview + sectionCounts.answeredAndMarked}</td>
                  <td className="px-4 py-3 text-center font-medium">{sectionCounts.notAnswered}</td>
                  <td className="px-4 py-3 text-center font-medium">{sectionCounts.notVisited}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-exam-accent hover:bg-exam-accent/90 text-white text-sm font-semibold rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-exam-accent focus:ring-offset-2 flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Submitting...
              </>
            ) : 'Submit Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
