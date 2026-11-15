/**
 * Exam settings that may differ between deployments.
 *
 * NEXT_PUBLIC_EXAM_ANSWER_BACKUP_RETENTION_DAYS
 *   How many days this browser keeps its local copy of an attempt's answers,
 *   counted from submission (or from the last change if never submitted).
 *   The copy is evidence if the server's record of an attempt is ever wrong.
 *   Default: 30. Must be a positive whole number.
 */

const DEFAULT_ANSWER_BACKUP_RETENTION_DAYS = 30;

function parsePositiveInteger(rawValue, name, fallback) {
  if (rawValue === undefined || rawValue === '') {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `${name} must be a positive whole number of days, but was "${rawValue}".`
    );
  }

  return value;
}

export const examConfig = Object.freeze({
  answerBackupRetentionDays: parsePositiveInteger(
    process.env.NEXT_PUBLIC_EXAM_ANSWER_BACKUP_RETENTION_DAYS,
    'NEXT_PUBLIC_EXAM_ANSWER_BACKUP_RETENTION_DAYS',
    DEFAULT_ANSWER_BACKUP_RETENTION_DAYS
  ),
});
