'use client';

import { useAppSelector } from '../../../hooks/useAppSelector';

export default function ExamTimer() {
  const remainingSeconds =
    useAppSelector(
      (state) =>
        state.attempt.attempt
          ?.remainingSeconds || 0
    );

  const safeRemainingSeconds =
    Math.max(
      0,
      Number(remainingSeconds) || 0
    );

  const hours = Math.floor(
    safeRemainingSeconds / 3600
  );

  const minutes = Math.floor(
    (safeRemainingSeconds % 3600) / 60
  );

  const seconds =
    safeRemainingSeconds % 60;

  const pad = (num) =>
    String(num).padStart(2, '0');

  let colorClass =
    'text-exam-text';

  if (safeRemainingSeconds < 60) {
    colorClass = 'text-rose-600';
  } else if (
    safeRemainingSeconds < 600
  ) {
    colorClass = 'text-amber-600';
  }

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`font-semibold text-lg ${colorClass} tracking-wider`}
    >
      {hours > 0
        ? `${pad(hours)}:`
        : ''}
      {pad(minutes)}:{pad(seconds)}
    </div>
  );
}