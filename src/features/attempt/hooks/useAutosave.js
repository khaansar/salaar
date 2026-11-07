'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import {
  markExpired,
  markSyncedIfUnchanged,
  updateAttemptVersion,
} from '../store/attemptSlice';
import { useSaveResponsesMutation } from '../store/attemptApi';
import { attemptService } from '../../../services/attemptService';

const MAX_CONFLICT_RETRIES = 3;
// Backoff for retrying a failed autosave: 2s, 4s, 8s ... capped at 30s.
const RETRY_BASE_DELAY_MS = 2000;
const RETRY_MAX_DELAY_MS = 30000;

function serializeAnswer(response) {
  if (response?.numeric !== undefined && response.numeric !== null) {
    return String(response.numeric);
  }

  if (Array.isArray(response?.selected)) {
    return response.selected.join(',');
  }

  return response?.selected == null
    ? null
    : String(response.selected);
}

export function useAutosave(attemptId) {
  const dispatch = useAppDispatch();
  const [saveResponses] = useSaveResponsesMutation();

  const responses = useAppSelector(
    (state) => state.attempt.responses
  );
  const sections = useAppSelector(
    (state) => state.attempt.sections
  );
  const currentQuestionId = useAppSelector(
    (state) => state.attempt.ui.currentQuestionId
  );
  const attemptVersion = useAppSelector(
    (state) => state.attempt.attempt?.attemptVersion ?? 0
  );
  const status = useAppSelector(
    (state) => state.attempt.attempt?.status
  );
  const isExpired = useAppSelector(
    (state) => state.attempt.ui.isExpired
  );

  const stateRef = useRef({
    responses,
    sections,
    currentQuestionId,
  });
  const versionRef = useRef(attemptVersion);
  const queueRef = useRef(Promise.resolve());
  const inFlightRef = useRef(new Map());
  const failureCountRef = useRef(0);
  const retryTimerRef = useRef(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => () => clearTimeout(retryTimerRef.current), []);

  useEffect(() => {
    stateRef.current = {
      responses,
      sections,
      currentQuestionId,
    };
  }, [responses, sections, currentQuestionId]);

  useEffect(() => {
    versionRef.current = attemptVersion;
  }, [attemptVersion]);

  const saveOne = useCallback(async (qId) => {
    const response = stateRef.current.responses[qId];

    if (!response || response.saveState !== 'pending') {
      return;
    }

    // Capture the exact answer being sent. If the user edits it while
    // this request is in flight, markSyncedIfUnchanged preserves the edit.
    const snapshot = {
      selected: response.selected,
      numeric: response.numeric,
      marked: response.marked,
    };

    const allQuestionIds = stateRef.current.sections.flatMap(
      (section) => section.questionIds || []
    );
    const currentIndex = Math.max(
      0,
      allQuestionIds.indexOf(stateRef.current.currentQuestionId)
    );

    const payload = {
      questionId: qId,
      selectedOption: serializeAnswer(snapshot),
      currentQuestionIndex: currentIndex,
    };

    let conflictRetries = 0;

    while (true) {
      try {
        const result = await saveResponses({
          attemptId,
          ...payload,
          version: versionRef.current,
        }).unwrap();

        if (Number.isFinite(result?.attemptVersion)) {
          versionRef.current = result.attemptVersion;
          dispatch(updateAttemptVersion(result.attemptVersion));
        } else {
          // A successful response should carry the new version.
          // Reconcile instead of guessing the next version.
          const fresh = await attemptService.getAttemptState(attemptId);
          const freshVersion = fresh?.attempt?.attemptVersion;

          if (!Number.isFinite(freshVersion)) {
            throw new Error(
              'Save succeeded, but the latest attempt version is unavailable.'
            );
          }

          versionRef.current = freshVersion;
          dispatch(updateAttemptVersion(freshVersion));
        }

        dispatch(markSyncedIfUnchanged({ qId, ...snapshot }));
        return;
      } catch (error) {
        const httpStatus = error?.status;

        if (httpStatus === 410) {
          throw new Error('ATTEMPT_EXPIRED');
        }

        if (httpStatus !== 409) {
          throw error;
        }

        if (conflictRetries >= MAX_CONFLICT_RETRIES) {
          throw new Error(
            'CONFLICT: Could not save the answer after refreshing the attempt version.'
          );
        }

        conflictRetries += 1;

        // Refresh the authoritative version, then retry this same
        // answer. Do not overwrite the local answer with server data.
        const fresh = await attemptService.getAttemptState(attemptId);
        const freshVersion = fresh?.attempt?.attemptVersion;

        if (!Number.isFinite(freshVersion)) {
          throw new Error(
            'CONFLICT: Could not retrieve the latest attempt version.'
          );
        }

        versionRef.current = freshVersion;
        dispatch(updateAttemptVersion(freshVersion));
      }
    }
  }, [attemptId, dispatch, saveResponses]);

  const enqueueSave = useCallback((qId) => {
    if (!attemptId) {
      return Promise.reject(new Error('Missing attempt ID.'));
    }

    const existing = inFlightRef.current.get(qId);
    if (existing) {
      return existing;
    }

    // A single queue prevents saves for different questions from
    // concurrently using the same attempt-wide version.
    const job = queueRef.current
      .catch(() => {
        // A failed prior job must not permanently poison the queue.
      })
      .then(() => saveOne(qId));

    inFlightRef.current.set(qId, job);

    const trackedJob = job.finally(() => {
      if (inFlightRef.current.get(qId) === trackedJob) {
        inFlightRef.current.delete(qId);
      }
    });

    inFlightRef.current.set(qId, trackedJob);
    queueRef.current = trackedJob;
    return trackedJob;
  }, [attemptId, saveOne]);

  const flushAutosave = useCallback(async () => {
    // Keep checking because a save may finish while the user has
    // changed an answer, making that answer pending again.
    for (let pass = 0; pass < 20; pass += 1) {
      const pendingIds = Object.keys(stateRef.current.responses).filter(
        (qId) =>
          stateRef.current.responses[qId]?.saveState === 'pending'
      );

      const inFlight = [...inFlightRef.current.values()];

      if (pendingIds.length === 0 && inFlight.length === 0) {
        return;
      }

      await Promise.all(inFlight);

      for (const qId of pendingIds) {
        // If a request for this question is already in flight, wait
        // for it; otherwise queue the latest pending answer.
        await enqueueSave(qId);
      }

      await queueRef.current;
    }

    const stillPending = Object.values(stateRef.current.responses).some(
      (response) => response?.saveState === 'pending'
    );

    if (stillPending) {
      throw new Error(
        'Some answers could not be saved. Please retry before submitting.'
      );
    }
  }, [enqueueSave]);

  useEffect(() => {
    // Saves use the REST API, so they must not depend on the SSE stream's
    // connection state; a dropped stream would otherwise block all saves.
    if (!attemptId) return;
    if (status && status !== 'IN_PROGRESS') return;
    if (isExpired) return;

    const pendingIds = Object.keys(responses).filter(
      (qId) => responses[qId]?.saveState === 'pending'
    );

    if (pendingIds.length === 0) return;

    const timer = setTimeout(async () => {
      // Queue every pending answer so one failing question cannot
      // starve the others; the queue still sends them one at a time.
      const results = await Promise.allSettled(
        pendingIds.map((qId) => enqueueSave(qId))
      );
      const failures = results.filter((r) => r.status === 'rejected');

      if (failures.length === 0) {
        failureCountRef.current = 0;
        return;
      }

      failures.forEach((f) => console.error('Autosave failed:', f.reason));

      if (failures.some((f) => f.reason?.message === 'ATTEMPT_EXPIRED')) {
        dispatch(markExpired());
        return;
      }

      // A failed answer stays pending without changing `responses`, so
      // schedule a retry explicitly instead of waiting for the next edit.
      const delay = Math.min(
        RETRY_MAX_DELAY_MS,
        RETRY_BASE_DELAY_MS * 2 ** failureCountRef.current
      );
      failureCountRef.current += 1;
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(
        () => setRetryNonce((n) => n + 1),
        delay
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    attemptId,
    dispatch,
    enqueueSave,
    isExpired,
    responses,
    retryNonce,
    status,
  ]);

  return { flush: flushAutosave };
}