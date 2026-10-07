'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setCurrentSection, setSectionSubmitModalOpen, setTargetSectionId } from '../store/attemptSlice';
import { makeSelectPaletteCounts } from '../store/selectors';
import { useMemo } from 'react';
import { Menu } from 'lucide-react';

import { useSwitchSectionMutation } from '../store/attemptApi';

export default function SectionTabs() {
  const dispatch = useAppDispatch();
  const attempt = useAppSelector(state => state.attempt.attempt);
  const sections = useAppSelector(state => state.attempt.sections);
  const currentSectionId = useAppSelector(state => state.attempt.ui.currentSectionId);
  const [switchSection] = useSwitchSectionMutation();

  if (!sections || sections.length === 0) return null;

  return (
    <div className="h-[48px] border-b border-exam-border bg-exam-panel flex items-end px-2 shrink-0 overflow-x-auto hide-scrollbar w-full shadow-sm">
      {sections.map(section => {
        const isActive = section.id === currentSectionId;
        const total = section.questionIds?.length || 0;
        
        let isExpired = false;
        let isSectionTiming = false;
        if (section.durationMinutes) {
          isSectionTiming = true;
          const spent = attempt?.sectionTimeSpentSec?.[section.id] || 0;
          if (spent >= section.durationMinutes * 60) {
            isExpired = true;
          }
        }
        
        return (
          <button
            key={section.id}
            onClick={() => {
              if (isExpired) return;
              if (!isActive) {
                if (isSectionTiming) {
                  dispatch(setTargetSectionId(section.id));
                  dispatch(setSectionSubmitModalOpen(true));
                } else {
                  dispatch(setCurrentSection(section.id));
                  if (attempt?.id) {
                    switchSection({ attemptId: attempt.id, sectionId: section.id, submitCurrent: false })
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
              }
            }}
            disabled={isExpired}
            className={`
              h-10 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap text-sm font-medium
              ${isExpired ? 'opacity-50 cursor-not-allowed border-transparent text-exam-text-muted' : 
                isActive 
                ? 'border-exam-accent text-exam-accent' 
                : 'border-transparent text-exam-text-muted hover:text-exam-text hover:bg-exam-bg/50'
              }
            `}
          >
            {section.name}
            {/* Ideally show counts here if requested, e.g., "12/25 answered", but we keep it clean */}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-exam-accent-light text-exam-accent' : 'bg-exam-bg text-exam-text-muted'}`}>
              {total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
