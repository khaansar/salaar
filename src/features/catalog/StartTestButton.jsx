'use client';

import { useMemo } from 'react';
import { ArrowRight, Lock, Loader2, CheckCircle } from 'lucide-react';

import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useGetAttemptHistoryQuery } from '../../store/userApi';
import { useMyEntitlements } from './useMyEntitlements';
import { hasActiveEntitlementForTest } from './entitlementUtils';

function getAttemptRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

export default function StartTestButton({
  testId,
  testSlug,
  seriesId,
  isFree = false,
  variant = 'default',
  hasAttempted,
  hasAccessCode = false,
}) {
  const requireAuth = useRequireAuth();
  const { user } = useAppSelector((state) => state.auth);

  // Entitlements are relevant only to paid tests.
  const {
    entitlements,
    isLoading: entitlementsLoading,
    isError: entitlementsError,
  } = useMyEntitlements({
    enabled: Boolean(user) && !isFree,
  });

  const { data: attemptHistory } = useGetAttemptHistoryQuery(
    { page: 1, perPage: 100 },
    { skip: !user }
  );

  const attemptedByCurrentUser = useMemo(
    () =>
      getAttemptRecords(attemptHistory).some((attempt) =>
        [attempt?.testId, attempt?.testSlug].some(
          (value) =>
            String(value ?? '') ===
            String(testId ?? testSlug ?? '')
        )
      ),
    [attemptHistory, testId, testSlug]
  );

  const entitled =
    isFree ||
    (Boolean(user) &&
      hasActiveEntitlementForTest(entitlements, {
        testId,
        id: testId,
        seriesId,
        isFree,
      }));

  // Free tests never wait for or depend on entitlement checks.
  const entitlementPending =
    !isFree && Boolean(user) && entitlementsLoading;

  const locked =
    !isFree &&
    (!user || !entitled || entitlementsError || entitlementPending);

  const retry = hasAttempted ?? attemptedByCurrentUser;
  const isClassroomTest = Boolean(hasAccessCode);
  const classroomAttemptBlocked = isClassroomTest && retry;

  const disabled = (!isFree && locked) || classroomAttemptBlocked;

  const handleStart = requireAuth(() => {
    // Do not block free tests on paid-access checks.
    if (disabled) return;

    const identifier = testSlug || testId;
    if (!identifier) return;

    const url = `/tests/${encodeURIComponent(identifier)}/instructions`;
    const features =
      'popup=1,width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes';

    window.open(url, '_blank', features);
  });

  const buttonLayout =
    variant === 'outline'
      ? 'w-full rounded-md border px-3 py-2 text-xs'
      : variant === 'home'
        ? 'w-full rounded-xl px-3 py-2.5 text-sm'
        : 'w-full gap-2 rounded-xl px-6 py-3 text-sm sm:w-auto';

  const buttonColors = locked || classroomAttemptBlocked
    ? 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
    : variant === 'outline'
      ? 'border-brand-600 bg-white text-brand-600 hover:bg-brand-50'
      : 'bg-indigo-600 text-white hover:bg-indigo-700';

  let label = 'Start Test';

  if (!isFree && entitlementPending) {
    label = 'Checking access…';
  } else if (locked) {
    label = 'Locked';
  } else if (classroomAttemptBlocked) {
    label = 'Attempt Completed';
  } else if (retry) {
    label = 'Attempt test again';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      title={
        classroomAttemptBlocked
          ? 'Classroom code tests allow strictly one attempt per student.'
          : locked
          ? 'Purchase this test or its test series to unlock access.'
          : undefined
      }
      onClick={handleStart}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 ${buttonLayout} ${buttonColors}`}
    >
      {!isFree && entitlementPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          {label}
        </>
      ) : locked ? (
        <>
          <Lock
            size={variant === 'outline' ? 13 : 16}
            aria-hidden="true"
          />
          {label}
        </>
      ) : classroomAttemptBlocked ? (
        <>
          <CheckCircle
            size={variant === 'outline' ? 13 : 16}
            aria-hidden="true"
          />
          {label}
        </>
      ) : (
        <>
          {label}
          <ArrowRight
            size={variant === 'outline' ? 13 : 16}
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );
}