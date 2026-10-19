'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, Clock, AlertCircle } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/common/ToastProvider';

const RETURN_TO_KEY = 'salaar:attempt-return-to';

function getOriginatingPage() {
  try {
    if (!document.referrer) return '/tests';
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin) return '/tests';
    const path = `${referrer.pathname}${referrer.search}${referrer.hash}`;
    if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/attempt/') || path.startsWith('/login') || path.startsWith('/signup') || path.includes('/instructions')) return '/tests';
    return path;
  } catch {
    return '/tests';
  }
}

export default function InstructionsClient({
  testId,
  durationMinutes,
  disabled,
  windowStartTime,
  windowEndTime,
  hasAccessCode,
}) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [agreed, setAgreed] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [starting, setStarting] = useState(false);

  const now = new Date();
  const startDate = windowStartTime ? new Date(windowStartTime) : null;
  const endDate = windowEndTime ? new Date(windowEndTime) : null;

  const isBeforeWindow = startDate && now < startDate;
  const isAfterWindow = endDate && now > endDate;

  const handleBegin = requireAuth(async () => {
    if (!agreed || starting || isBeforeWindow || isAfterWindow) return;
    if (hasAccessCode && !accessCode.trim()) {
      toast.error('Please enter the classroom access code to begin');
      return;
    }
    setStarting(true);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed or was denied:', err);
        });
      }

      const attempt = await attemptService.startAttempt(testId, durationMinutes, accessCode);
      if (!attempt?.attemptId) throw new Error('The server did not return an attempt ID.');

      try {
        window.sessionStorage.setItem(RETURN_TO_KEY, getOriginatingPage());
      } catch {
        // The submit flow falls back to /history if sessionStorage is unavailable.
      }

      router.replace(`/attempt/${attempt.attemptId}`);
    } catch (error) {
      toast.error(error?.message || 'Unable to start the test. Please check your access code and timing.');
      setStarting(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  });

  if (disabled) return null;

  return (
    <div className="flex flex-col gap-4">
      {hasAccessCode && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            <KeyRound size={18} />
            <span>Classroom Code:</span>
          </div>
          <input
            type="text"
            placeholder="Enter access code (e.g. CLASS-10A)"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            disabled={starting}
            className="flex-1 max-w-xs px-3.5 py-2 text-sm uppercase font-mono tracking-wider bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Obtain this code from your teacher or exam coordinator.
          </span>
        </div>
      )}

      {isBeforeWindow && (
        <div className="flex items-center gap-2 p-3 text-sm text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
          <Clock size={16} />
          <span>This exam is scheduled to open on <strong>{startDate.toLocaleString()}</strong>. You cannot start early.</span>
        </div>
      )}

      {isAfterWindow && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle size={16} />
          <span>This exam window closed on <strong>{endDate.toLocaleString()}</strong>. New attempts are no longer permitted.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={starting || isBeforeWindow || isAfterWindow}
            />
            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
            <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            I have read and understood the instructions.
          </span>
        </label>

        <button
          type="button"
          disabled={!agreed || starting || isBeforeWindow || isAfterWindow || (hasAccessCode && !accessCode.trim())}
          onClick={handleBegin}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {starting ? (
            <><Loader2 size={16} className="animate-spin" />Starting Exam...</>
          ) : isBeforeWindow ? (
            'Exam Not Started Yet'
          ) : isAfterWindow ? (
            'Exam Window Closed'
          ) : (
            'Ready to Begin'
          )}
        </button>
      </div>
    </div>
  );
}
