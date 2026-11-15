'use client';

import { useEffect } from 'react';

import { useAppDispatch } from '../../../hooks/useAppDispatch';

import {
  updateRemainingTime,
  setConnectionState,
  markExpired,
} from '../store/attemptSlice';

import { MockEventSource } from '../mock/mockStream';
import { attemptService } from '../../../services/attemptService';

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

export function useAttemptStream(
  attemptId,
  enabled = true
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!attemptId || !enabled) {
      return;
    }

    dispatch(
      setConnectionState('connecting')
    );

    const es = USE_MOCKS
      ? new MockEventSource(
          `/attempts-api/${attemptId}/stream`
        )
      : new EventSource(
          attemptService.getStreamUrl(
            attemptId
          ),
          {
            withCredentials: true,
          }
        );

    es.onopen = () => {
      dispatch(
        setConnectionState('connected')
      );
    };

    es.addEventListener('time_warning', (event) => {
      try {
        const data = JSON.parse(event.data);
        dispatch(setConnectionState('connected'));
        console.warn('Time warning from server:', data);
        
        if (data.remainingSeconds <= 0) {
           dispatch(markExpired());
        }
      } catch {
        // Ignore a malformed warning; the timer keeps counting locally.
      }
    });

    es.onerror = () => {
      dispatch(setConnectionState('offline'));
    };

    return () => {
      es.close();

      dispatch(
        setConnectionState('offline')
      );
    };
  }, [
    attemptId,
    enabled,
    dispatch,
  ]);
}