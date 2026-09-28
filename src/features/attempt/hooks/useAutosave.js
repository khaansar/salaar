'use client';
import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setSaveState } from '../store/attemptSlice';
import { useSaveResponsesMutation } from '../store/attemptApi';

export function useAutosave(attemptId) {
  const dispatch = useAppDispatch();
  const [saveResponses] = useSaveResponsesMutation();
  const responses = useAppSelector(state => state.attempt.responses);
  const connection = useAppSelector(state => state.attempt.ui.connection);
  
  // Keep track of pending saves to avoid infinite loops
  const pendingQueue = useRef(new Map());

  useEffect(() => {
    // Find all responses that are 'pending'
    const pendingIds = Object.keys(responses).filter(qId => responses[qId].saveState === 'pending');
    
    if (pendingIds.length === 0 || connection === 'offline') return;

    // Add to local queue ref to avoid re-triggering while saving
    const toSave = [];
    pendingIds.forEach(qId => {
      if (!pendingQueue.current.has(qId)) {
        pendingQueue.current.set(qId, true);
        toSave.push({
          questionId: qId,
          selected: responses[qId].selected,
          numeric: responses[qId].numeric,
          marked: responses[qId].marked,
          timeSpentSeconds: 0 // Mock for now
        });
      }
    });

    if (toSave.length === 0) return;

    // Debounce/batch save
    const timer = setTimeout(async () => {
      try {
        await saveResponses({ attemptId, updates: toSave }).unwrap();
        
        // On success, clear queue and update state
        toSave.forEach(update => {
          pendingQueue.current.delete(update.questionId);
          dispatch(setSaveState({ qId: update.questionId, saveState: 'synced' }));
        });
        
      } catch (err) {
        console.error('Autosave failed', err);
        // On fail, let them remain pending. Queue ref can be cleared to retry later
        toSave.forEach(update => {
          pendingQueue.current.delete(update.questionId);
        });
      }
    }, 1000); // 1 second debounce/batch window

    return () => clearTimeout(timer);
  }, [responses, connection, attemptId, dispatch]);

}
