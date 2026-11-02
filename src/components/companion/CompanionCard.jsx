'use client';

import { useEffect, useState } from 'react';
import { MathText } from '../common/MathText';
import { companionService } from '../../services/companionService';

const BUTTON =
  'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const QUIET_BUTTON = `${BUTTON} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`;

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} hr`;
  return `${minutes / 1440} day`;
}

export default function CompanionCard({ prompt, onClose }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [sleepOptions, setSleepOptions] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    companionService
      .getSettings()
      .then((settings) => setSleepOptions(settings.sleepOptionsMinutes))
      .catch(() => setSleepOptions([]));
  }, []);

  const closeAfter = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch {
      // A failed companion call must never interrupt the student.
    }
    onClose();
  };

  const submitAnswer = async () => {
    setBusy(true);
    try {
      setResult(await companionService.answer(prompt.id, selected));
      setBusy(false);
    } catch {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Practice question from Kalki"
      className="fixed inset-x-4 bottom-52 z-50 max-h-[calc(100vh-14rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:left-auto sm:right-6 sm:w-[26rem] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
        Quick question
      </p>
      <MathText text={prompt.questionText} className="mb-5 text-base font-medium leading-relaxed" />

      <div className="flex flex-col gap-3">
        {prompt.options.map((option) => {
          const isChosen = selected === option.key;
          const isAnswer = result?.correctOption === option.key;
          const tone = isAnswer
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
            : result && isChosen
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
              : isChosen
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600';

          return (
            <button
              key={option.key}
              type="button"
              disabled={Boolean(result) || busy}
              aria-pressed={isChosen}
              onClick={() => setSelected(option.key)}
              className={`rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-colors ${tone}`}
            >
              <MathText text={option.text} />
            </button>
          );
        })}
      </div>

      {result ? (
        <div className="mt-5 text-sm leading-relaxed" role="status">
          <p className="font-semibold">{result.correct ? 'Correct!' : 'Not quite.'}</p>
          <MathText text={result.explanation} className="mt-2 text-slate-600 dark:text-slate-300" />
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={onClose} className={QUIET_BUTTON}>
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => closeAfter(() => companionService.skip(prompt.id))}
              className={QUIET_BUTTON}
            >
              Skip
            </button>
            <button
              type="button"
              disabled={!selected || busy}
              onClick={submitAnswer}
              className={`${BUTTON} bg-orange-500 text-white hover:bg-orange-600`}
            >
              Answer
            </button>
          </div>

          {sleepOptions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="mr-1">Sleep for</span>
              {sleepOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    closeAfter(() => companionService.updateSettings({ sleepMinutes: minutes }))
                  }
                  className="rounded-md px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {formatMinutes(minutes)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
