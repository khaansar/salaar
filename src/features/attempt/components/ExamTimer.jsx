'use client';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { attemptService } from '../../../services/attemptService';

export default function ExamTimer() {
  const attempt = useAppSelector((state) => state.attempt.attempt);
  const expiresAtStr = attempt?.expiresAt;
  const status = attempt?.status;
  const dispatch = useAppDispatch();
  
  const [safeRemainingSeconds, setSafeRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAtStr || status !== 'IN_PROGRESS') return;
    const expiresAt = new Date(expiresAtStr).getTime();

    const calculate = () => {
      const remainingMs = expiresAt - Date.now();
      const remainingSecs = Math.floor(Math.max(0, remainingMs) / 1000);
      setSafeRemainingSeconds(remainingSecs);
      
      if (remainingSecs <= 0) {
        clearInterval(interval);
        // Force submit or transition to expired
        // As per plan, stop at zero and notify attempt flow
        if (attempt?.id) {
          dispatch({ type: 'attempt/markExpired' });
        }
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAtStr, status, attempt?.id, dispatch]);

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