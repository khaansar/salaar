import { examConfig } from '../../../config/exam';

/*
 * A per-attempt copy of every answer, kept in this browser's localStorage.
 *
 * - While the attempt is in progress it is rewritten on every answer change,
 *   so answers survive a reload, a crash or a forced login.
 * - Answers the server never confirmed are re-queued for saving when the
 *   exam is opened again.
 * - It is kept after submission (see examConfig.answerBackupRetentionDays),
 *   recording when each answer last changed and when the server confirmed
 *   it, so a wrong server record can be checked against it.
 */

const KEY_PREFIX = 'salaar:attempt-answers:';
const FORMAT_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

const storageKey = (attemptId) => `${KEY_PREFIX}${attemptId}`;

function getStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readAnswerBackup(attemptId) {
  const storage = getStorage();
  if (!storage || !attemptId) return null;

  try {
    const backup = JSON.parse(storage.getItem(storageKey(attemptId)));
    return backup?.version === FORMAT_VERSION ? backup : null;
  } catch {
    return null;
  }
}

function persist(attemptId, backup) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(storageKey(attemptId), JSON.stringify(backup));
  } catch (error) {
    // Storage full or blocked: the server autosave is still the primary copy.
    console.warn('Could not write the local answer backup:', error);
  }
}

const sameAnswer = (a, b) =>
  JSON.stringify(a?.selected ?? null) === JSON.stringify(b?.selected ?? null) &&
  (a?.numeric ?? null) === (b?.numeric ?? null) &&
  Boolean(a?.marked) === Boolean(b?.marked);

/** Records the current answers of an in-progress attempt. */
export function writeAnswerBackup(attempt, responses) {
  if (!attempt?.id) return;

  const previous = readAnswerBackup(attempt.id);
  if (previous?.submittedAt) return; // Keep the copy taken at submission.

  const now = new Date().toISOString();
  const answers = {};

  Object.entries(responses || {}).forEach(([questionId, response]) => {
    const before = previous?.answers?.[questionId];
    const hasContent =
      response?.selected?.length > 0 ||
      (response?.numeric !== undefined && response?.numeric !== null && response?.numeric !== '') ||
      response?.marked ||
      before;

    if (!hasContent) return;

    const changed = !before || !sameAnswer(before, response);
    const confirmedNow =
      response.saveState === 'synced' && (changed || before.saveState !== 'synced');

    answers[questionId] = {
      selected: response.selected ?? null,
      numeric: response.numeric ?? null,
      marked: Boolean(response.marked),
      saveState: response.saveState === 'pending' ? 'pending' : 'synced',
      changedAt: changed ? now : before.changedAt,
      serverConfirmedAt: confirmedNow ? now : before?.serverConfirmedAt ?? null,
    };
  });

  persist(attempt.id, {
    version: FORMAT_VERSION,
    attemptId: attempt.id,
    testId: attempt.testId ?? null,
    title: attempt.title ?? null,
    startedAt: previous?.startedAt ?? now,
    updatedAt: now,
    submittedAt: null,
    answers,
  });
}

/** Freezes the copy as the answers held at submission time. */
export function markAnswerBackupSubmitted(attemptId) {
  const backup = readAnswerBackup(attemptId);
  if (!backup || backup.submittedAt) return;

  persist(attemptId, { ...backup, submittedAt: new Date().toISOString() });
}

/**
 * Re-applies answers the server never confirmed onto freshly loaded attempt
 * data and marks them pending, so autosave sends them again.
 */
export function mergeUnsavedAnswers(data, backup) {
  if (!data?.attempt || data.attempt.status !== 'IN_PROGRESS') return data;
  if (!backup || backup.submittedAt) return data;

  const unsaved = Object.entries(backup.answers || {}).filter(
    ([questionId, answer]) => answer.saveState === 'pending' && data.questions?.[questionId]
  );

  if (unsaved.length === 0) return data;

  const responses = { ...data.responses };

  unsaved.forEach(([questionId, answer]) => {
    responses[questionId] = {
      ...responses[questionId],
      visited: true,
      selected: answer.selected ?? undefined,
      numeric: answer.numeric ?? undefined,
      marked: answer.marked,
      saveState: 'pending',
    };
  });

  return { ...data, responses };
}

/** Removes copies older than the configured retention period. */
export function pruneAnswerBackups() {
  const storage = getStorage();
  if (!storage) return;

  const cutoff = Date.now() - examConfig.answerBackupRetentionDays * DAY_MS;

  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(KEY_PREFIX)) keys.push(key);
    }

    keys.forEach((key) => {
      try {
        const backup = JSON.parse(storage.getItem(key));
        const lastActivity = Date.parse(backup?.submittedAt || backup?.updatedAt);
        if (!Number.isFinite(lastActivity) || lastActivity < cutoff) {
          storage.removeItem(key);
        }
      } catch {
        storage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Could not prune old local answer backups:', error);
  }
}
