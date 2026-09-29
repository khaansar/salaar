'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import {
  markSyncedIfUnchanged,
} from '../store/attemptSlice';
import { attemptService } from '../../../services/attemptService';

export function useAutosave(attemptId) {
  const dispatch = useAppDispatch();

  const responses = useAppSelector(
    (state) => state.attempt.responses
  );

  const connection = useAppSelector(
    (state) => state.attempt.ui.connection
  );

  const pendingQueue = useRef(new Map());

  useEffect(() => {
    if (!attemptId) {
      return;
    }

    if (connection === 'offline') {
      return;
    }

    const pendingIds = Object.keys(responses).filter(
      (qId) =>
        responses[qId]?.saveState === 'pending'
    );

    if (pendingIds.length === 0) {
      return;
    }

    const toSave = [];

    pendingIds.forEach((qId) => {
      if (pendingQueue.current.has(qId)) {
        return;
      }

      const response = responses[qId];

      pendingQueue.current.set(qId, true);

      toSave.push({
        questionId: qId,
        selected: response.selected,
        numeric: response.numeric,
        marked: response.marked,
        timeSpentSeconds: 0,
      });
    });

    if (toSave.length === 0) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await attemptService.saveResponses(
          attemptId,
          toSave
        );

        /*
         * Only mark an answer synced if the current Redux
         * value is still exactly what we sent.
         */
        toSave.forEach((update) => {
          dispatch(
            markSyncedIfUnchanged({
              qId: update.questionId,
              selected: update.selected,
              numeric: update.numeric,
              marked: update.marked,
            })
          );

          pendingQueue.current.delete(
            update.questionId
          );
        });
      } catch (error) {
        console.error(
          'Autosave failed',
          error
        );

        /*
         * Keep saveState = pending.
         *
         * This means the next state change / reconnect
         * can retry the update.
         */
        toSave.forEach((update) => {
          pendingQueue.current.delete(
            update.questionId
          );
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    responses,
    connection,
    attemptId,
    dispatch,
  ]);
}