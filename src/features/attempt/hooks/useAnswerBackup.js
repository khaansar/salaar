'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import {
  pruneAnswerBackups,
  readAnswerBackup,
  writeAnswerBackup,
} from '../lib/answerBackup';

/**
 * Keeps the local answer copy current while the attempt is in progress and
 * asks for confirmation before the tab closes with unsaved answers.
 */
export function useAnswerBackup(attemptId) {
  const attempt = useAppSelector((state) => state.attempt.attempt);
  const responses = useAppSelector((state) => state.attempt.responses);
  const hasUnsavedRef = useRef(false);
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    pruneAnswerBackups();
  }, []);

  const isCurrentAttempt =
    attempt?.id === attemptId && attempt?.status === 'IN_PROGRESS';

  useEffect(() => {
    if (!isCurrentAttempt) return;

    writeAnswerBackup(attempt, responses);
    hasUnsavedRef.current = Object.values(responses).some(
      (response) => response?.saveState === 'pending'
    );
  }, [attempt, responses, isCurrentAttempt]);

  useEffect(() => {
    // A forced login keeps the unsaved answers in the local copy and resends
    // them afterwards, so that redirect must not be blocked by a prompt.
    const handleSessionExpired = () => {
      sessionEndedRef.current = true;
    };

    const handleBeforeUnload = (event) => {
      if (
        !hasUnsavedRef.current ||
        sessionEndedRef.current ||
        readAnswerBackup(attemptId)?.submittedAt
      ) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [attemptId]);
}
