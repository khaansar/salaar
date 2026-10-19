'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/common/ToastProvider';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetAttemptHistoryQuery } from '@/store/userApi';

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

function getAttemptRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

export default function InstructionsClient({
  testId,
  testSlug,
  durationMinutes,
  disabled,
  windowStartTime,
  windowEndTime,
  hasAccessCode,
  serverTime,
  initialUserAttempt = null,
}) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const [agreed, setAgreed] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [starting, setStarting] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => (serverTime ? new Date(serverTime) : new Date()));

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: attemptHistory } = useGetAttemptHistoryQuery(
    { page: 1, perPage: 100 },
    { skip: !user }
  );

  const existingAttempt = useMemo(() => {
    if (!user) return initialUserAttempt || null;
    const records = getAttemptRecords(attemptHistory);
    const found = records.find((att) =>
      [att?.testId, att?.testSlug].some(
        (val) =>
          Boolean(val) &&
          (String(val) === String(testId ?? '') || String(val) === String(testSlug ?? ''))
      )
    );
    return found || initialUserAttempt || null;
  }, [user, attemptHistory, testId, testSlug, initialUserAttempt]);

  const hasExistingAttempt = Boolean(existingAttempt);
  const isInProgressAttempt = Boolean(existingAttempt && existingAttempt.status === 'IN_PROGRESS');
  // Strictly enforce only one attempt per student for classroom code tests.
  const isClassroomAttemptLimitReached = Boolean(hasAccessCode && hasExistingAttempt && !isInProgressAttempt);

  const startDate = windowStartTime ? new Date(windowStartTime) : null;
  const endDate = windowEndTime ? new Date(windowEndTime) : null;

  const isStartDateValid = Boolean(startDate && !Number.isNaN(startDate.getTime()));
  const isEndDateValid = Boolean(endDate && !Number.isNaN(endDate.getTime()));

  const isBeforeWindow = Boolean(isStartDateValid && currentTime < startDate);
  const isAfterWindow = Boolean(isEndDateValid && currentTime > endDate);

  const handleBegin = requireAuth(async () => {
    if (hasAccessCode && isInProgressAttempt && existingAttempt?.attemptId) {
      router.replace(`/attempt/${existingAttempt.attemptId}`);
      return;
    }

    if (
      !agreed ||
      starting ||
      isBeforeWindow ||
      isAfterWindow ||
      isClassroomAttemptLimitReached
    ) {
      if (isClassroomAttemptLimitReached) {
        toast.error('Classroom code tests allow strictly one attempt per student.');
      }
      return;
    }

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
      {isClassroomAttemptLimitReached && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-800 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-200">Attempt Limit Reached</p>
              <p className="text-xs sm:text-sm mt-0.5 text-red-700 dark:text-red-300">
                This classroom exam allows strictly <strong>one attempt per student</strong>. You have already completed your attempt and cannot retake it.
              </p>
            </div>
          </div>
          {existingAttempt?.attemptId && (
            <button
              type="button"
              onClick={() => router.push(`/attempt/${existingAttempt.attemptId}/result`)}
              className="shrink-0 inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 dark:bg-slate-900 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              View Your Result
            </button>
          )}
        </div>
      )}

      {hasAccessCode && isInProgressAttempt && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-2.5">
            <Clock size={18} className="shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-bold text-indigo-900 dark:text-indigo-200">Active Attempt In Progress</p>
              <p className="text-xs sm:text-sm mt-0.5 text-indigo-700 dark:text-indigo-300">
                You already have an active attempt for this classroom exam. You can resume your in-progress attempt.
              </p>
            </div>
          </div>
          {existingAttempt?.attemptId && (
            <button
              type="button"
              onClick={() => router.replace(`/attempt/${existingAttempt.attemptId}`)}
              className="shrink-0 inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Resume Attempt
            </button>
          )}
        </div>
      )}

      {hasAccessCode && !isClassroomAttemptLimitReached && !isInProgressAttempt && (
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
            disabled={starting || isBeforeWindow || isAfterWindow}
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
          <span>This exam is scheduled to open on <strong suppressHydrationWarning>{startDate?.toLocaleString()}</strong>. You cannot start early.</span>
        </div>
      )}

      {isAfterWindow && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle size={16} />
          <span>This exam window closed on <strong suppressHydrationWarning>{endDate?.toLocaleString()}</strong>. New attempts are no longer permitted.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className={`flex items-center gap-3 ${isClassroomAttemptLimitReached ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}`}>
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={starting || isBeforeWindow || isAfterWindow || isClassroomAttemptLimitReached}
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
          disabled={
            starting ||
            isBeforeWindow ||
            isAfterWindow ||
            isClassroomAttemptLimitReached ||
            (!isInProgressAttempt && (!agreed || (hasAccessCode && !accessCode.trim())))
          }
          onClick={handleBegin}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {starting ? (
            <><Loader2 size={16} className="animate-spin" />Starting Exam...</>
          ) : isClassroomAttemptLimitReached ? (
            'Attempt Completed (1 Allowed)'
          ) : isInProgressAttempt ? (
            'Resume In-Progress Exam'
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
