'use client';

import { useEffect } from 'react';

import { useAppDispatch } from '../../../hooks/useAppDispatch';

import {
  updateRemainingTime,
  setConnectionState,
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

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(
          event.data
        );

        dispatch(
          setConnectionState('connected')
        );

        if (
          data.remainingSeconds !==
          undefined
        ) {
          dispatch(
            updateRemainingTime(
              Number(data.remainingSeconds)
            )
          );
        }

        /*
         * Preferred future contract:
         *
         * {
         *   expiresAt: "2026-09-28T..."
         * }
         *
         * The backend should remain authoritative
         * for expiry.
         */
      } catch (error) {
        console.error(
          'Invalid attempt SSE payload',
          error
        );
      }
    };

    es.onerror = (error) => {
      console.error(
        'Attempt SSE error',
        error
      );

      dispatch(
        setConnectionState('offline')
      );
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