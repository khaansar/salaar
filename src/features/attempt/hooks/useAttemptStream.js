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
import { refreshSession } from '../../../lib/apiClient';

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

// EventSource.CLOSED; the mock stream has no readyState.
const EVENT_SOURCE_CLOSED = 2;
const RECONNECT_BASE_DELAY_MS = 2000;
const RECONNECT_MAX_DELAY_MS = 30000;

export function useAttemptStream(
  attemptId,
  enabled = true
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!attemptId || !enabled) {
      return;
    }

    let es = null;
    let reconnectTimer = null;
    let failedReconnects = 0;
    let disposed = false;

    // The browser retries a dropped stream by itself, but stops for good
    // when a retry is refused, which happens once the short-lived access
    // cookie has expired. Refresh the session, then open a new stream.
    const scheduleReconnect = () => {
      if (disposed || reconnectTimer) {
        return;
      }

      es?.close();

      const delay = Math.min(
        RECONNECT_MAX_DELAY_MS,
        RECONNECT_BASE_DELAY_MS * 2 ** failedReconnects
      );
      failedReconnects += 1;

      reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;

        try {
          await refreshSession();
        } catch {
          // Offline or server error: try again on the next reconnect. A
          // rejected session redirects to login inside refreshSession.
        }

        connect();
      }, delay);
    };

    const connect = () => {
      if (disposed) {
        return;
      }

      dispatch(
        setConnectionState('connecting')
      );

      es = USE_MOCKS
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
        failedReconnects = 0;
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

        if (es.readyState === EVENT_SOURCE_CLOSED) {
          scheduleReconnect();
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      es?.close();

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
