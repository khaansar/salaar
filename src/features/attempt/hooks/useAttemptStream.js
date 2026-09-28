'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updateRemainingTime, setConnectionState } from '../store/attemptSlice';
import { MockEventSource } from '../mock/mockStream';
import { attemptService } from '../../../services/attemptService';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

export function useAttemptStream(attemptId) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!attemptId) return;

    dispatch(setConnectionState('connecting'));

    const es = USE_MOCKS 
      ? new MockEventSource(`/attempts-api/${attemptId}/stream`)
      : new EventSource(attemptService.getStreamUrl(attemptId), { withCredentials: true });

    es.onmessage = (event) => {
      dispatch(setConnectionState('connected'));
      const data = JSON.parse(event.data);
      if (data.remainingSeconds !== undefined) {
        dispatch(updateRemainingTime(data.remainingSeconds));
      }
    };

    es.onerror = (err) => {
      console.error('SSE Error:', err);
      dispatch(setConnectionState('offline'));
      // Wait and reconnect logic is handled natively by EventSource, 
      // but we could implement exponential backoff if it completely closes.
    };

    return () => {
      es.close();
      dispatch(setConnectionState('offline'));
    };
  }, [attemptId, dispatch]);
}
