'use client';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { attemptService } from '../../../services/attemptService';

import { useSwitchSectionMutation } from '../store/attemptApi';

export default function ExamTimer() {
  const attempt = useAppSelector((state) => state.attempt.attempt);
  const expiresAtStr = attempt?.expiresAt;
  const status = attempt?.status;
  const dispatch = useAppDispatch();
  const [switchSection] = useSwitchSectionMutation();
  
  const [safeRemainingSeconds, setSafeRemainingSeconds] = useState(0);

  const currentSectionId = useAppSelector(state => state.attempt.ui.currentSectionId);
  const sections = useAppSelector(state => state.attempt.sections);

  useEffect(() => {
    if (!expiresAtStr || status !== 'IN_PROGRESS') return;
    const globalExpiresAt = new Date(expiresAtStr).getTime();

    const calculate = () => {
      let remainingSecs = 0;
      let isSectionTimer = false;

      const currentSection = sections.find(s => s.id === currentSectionId);
      
      if (currentSection?.durationMinutes) {
        isSectionTimer = true;
        const durationSecs = currentSection.durationMinutes * 60;
        const spentSecs = attempt?.sectionTimeSpentSec?.[currentSectionId] || 0;
        
        let elapsedSecs = 0;
        if (attempt?.currentSectionStartedAt) {
          const startedAtMs = new Date(attempt.currentSectionStartedAt).getTime();
          elapsedSecs = Math.floor(Math.max(0, Date.now() - startedAtMs) / 1000);
        }
        
        remainingSecs = Math.max(0, durationSecs - spentSecs - elapsedSecs);
      } else {
        const remainingMs = globalExpiresAt - Date.now();
        remainingSecs = Math.floor(Math.max(0, remainingMs) / 1000);
      }

      setSafeRemainingSeconds(remainingSecs);
      
      if (remainingSecs <= 0) {
        clearInterval(interval);
        // Stop at zero and notify attempt flow
        if (attempt?.id && !isSectionTimer) {
          dispatch({ type: 'attempt/markExpired' });
        } else if (attempt?.id && isSectionTimer) {
          const nextSection = sections.find(s => {
             const spent = attempt.sectionTimeSpentSec?.[s.id] || 0;
             return (!s.durationMinutes || spent < s.durationMinutes * 60) && s.id !== currentSectionId;
          });
          if (nextSection) {
            dispatch({ type: 'attempt/setCurrentSection', payload: nextSection.id });
            switchSection({ attemptId: attempt.id, sectionId: nextSection.id });
          } else {
             dispatch({ type: 'attempt/markExpired' });
          }
        }
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAtStr, status, attempt?.id, dispatch, currentSectionId, sections, attempt?.currentSectionStartedAt, attempt?.sectionTimeSpentSec, switchSection]);

  const hours = Math.floor(safeRemainingSeconds / 3600);
  const minutes = Math.floor((safeRemainingSeconds % 3600) / 60);
  const seconds = safeRemainingSeconds % 60;

  const pad = (num) =>
    String(num).padStart(2, '0');

  let colorClass =
    'text-exam-text';

  if (safeRemainingSeconds < 60) {
    colorClass = 'text-rose-600';
  } else if (
    safeRemainingSeconds < 600
  ) {
    colorClass = 'text-amber-600';
  }

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`font-semibold text-lg ${colorClass} tracking-wider`}
    >
      {hours > 0
        ? `${pad(hours)}:`
        : ''}
      {pad(minutes)}:{pad(seconds)}
    </div>
  );
}