'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { MathText } from '../common/MathText';
import { companionService } from '../../services/companionService';

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} hr`;
  return `${minutes / 1440} day`;
}

export default function CompanionCard({ prompt, onClose, onSleep }) {
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

  const finishAfter = async (action, finish) => {
    setBusy(true);
    try {
      await action();
    } catch {
      // A failed companion call must never interrupt the student.
    }
    finish();
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
      className="fixed inset-x-4 bottom-52 z-50 max-h-[calc(100vh-14rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:left-auto sm:right-6 sm:w-[26rem] dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-100">
        Quick question
      </p>
      <MathText
        text={prompt.questionText}
        className="mb-5 text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-50"
      />

      <div className="flex flex-col gap-3">
        {prompt.options.map((option) => {
          const isChosen = selected === option.key;
          const isAnswer = result?.correctOption === option.key;
          const tone = isAnswer
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
            : result && isChosen
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'
              : isChosen
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-600/20'
                : 'border-slate-200 hover:border-brand-600 dark:border-slate-800 dark:bg-slate-800/40';

          return (
            <button
              key={option.key}
              type="button"
              disabled={Boolean(result) || busy}
              aria-pressed={isChosen}
              onClick={() => setSelected(option.key)}
              className={`rounded-xl border px-4 py-3 text-left text-sm leading-relaxed text-slate-700 transition dark:text-slate-300 ${tone}`}
            >
              <MathText text={option.text} />
            </button>
          );
        })}
      </div>

      {result ? (
        <div className="mt-5 text-sm leading-relaxed" role="status">
          <p className={`font-semibold ${result.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
            {result.correct ? 'Correct!' : 'Not quite.'}
          </p>
          <MathText text={result.explanation} className="mt-2 text-slate-700 dark:text-slate-300" />
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => finishAfter(() => companionService.skip(prompt.id), onClose)}
            >
              Skip
            </Button>
            <Button disabled={!selected || busy} onClick={submitAnswer}>
              Answer
            </Button>
          </div>

          {sleepOptions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="mr-1">Sleep for</span>
              {sleepOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    finishAfter(
                      () => companionService.updateSettings({ sleepMinutes: minutes }),
                      onSleep
                    )
                  }
                  className="rounded-md px-2.5 py-1.5 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
