'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { markSyncedIfUnchanged } from '../store/attemptSlice';
import { useSaveResponsesMutation } from '../store/attemptApi';
import { attemptService } from '../../../services/attemptService';

export function useAutosave(attemptId) {
  const dispatch = useAppDispatch();
  const [saveResponses] = useSaveResponsesMutation();

  const responses = useAppSelector(
    (state) => state.attempt.responses
  );

  const connection = useAppSelector(
    (state) => state.attempt.ui.connection
  );

  const attemptVersion = useAppSelector(
    (state) => state.attempt.attempt?.attemptVersion || 0
  );

  // Keep track of pending saves to avoid infinite loops
  const pendingQueue = useRef(new Map());

  const flushAutosave = async () => {
    // Collect all pending IDs
    const pendingIds = Object.keys(responses).filter(
      (qId) => responses[qId]?.saveState === 'pending'
    );
    if (pendingIds.length === 0) return;

    for (const qId of pendingIds) {
      await processSave(qId);
    }
  };

  const processSave = async (qId) => {
    if (pendingQueue.current.has(qId)) return;
    pendingQueue.current.set(qId, true);

    const response = responses[qId];
    // Find currentQuestionIndex based on Redux state
    let currentIndex = 0;
    // Calculate index if needed, or simply pass the active one.
    // The backend wants the current active question index if available, or just a default.
    // Let's grab it from Redux if it's there.

    const payload = {
      questionId: qId,
      selectedOption: response.selected ? (Array.isArray(response.selected) ? response.selected.join(',') : response.selected) : (response.numeric || null),
      currentQuestionIndex: 0, // We can pass 0 for now as it's typically for tracking only
      version: attemptVersion,
    };

    try {
      const res = await saveResponses({ attemptId, ...payload }).unwrap();
      
      // Update attemptVersion from response
      if (res?.meta?.attemptVersion) {
         dispatch({ type: 'attempt/updateAttemptVersion', payload: res.meta.attemptVersion });
      }

      dispatch(
        markSyncedIfUnchanged({
          qId,
          selected: response.selected,
          numeric: response.numeric,
          marked: response.marked,
        })
      );
      pendingQueue.current.delete(qId);
    } catch (error) {
      pendingQueue.current.delete(qId);
      const status = error?.status;
      if (status === 410) {
        throw new Error('ATTEMPT_EXPIRED');
      }
      if (status === 409) {
        console.warn('Conflict saving answer, reconciling state...');
        try {
          const freshState = await attemptService.getAttemptState(attemptId);
          // dispatch the new attempt data to Redux
          dispatch({ type: 'attempt/setAttemptData', payload: freshState });
          
          // Note: The next render cycle will pick up the pending changes and retry 
          // automatically since the saveState is still 'pending' and we cleared the queue!
          // We don't need to recursively retry here, returning allows the next loop to handle it
          // with the newly dispatched attemptVersion!
          return;
        } catch (reconcileErr) {
           console.error('Failed to reconcile attempt state', reconcileErr);
        }
        throw new Error('CONFLICT');
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!attemptId || connection === 'offline') return;

    const pendingIds = Object.keys(responses).filter(
      (qId) => responses[qId]?.saveState === 'pending'
    );
    if (pendingIds.length === 0) return;

    // Process one by one
    const timer = setTimeout(async () => {
      try {
         await processSave(pendingIds[0]);
      } catch (err) {
         console.error('Autosave process error', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [responses, connection, attemptId, saveResponses, attemptVersion]);

  return { flush: flushAutosave };
}