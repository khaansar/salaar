'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Loader2, Lock } from 'lucide-react';

import { useRequireAuth } from '../../hooks/useRequireAuth';
import { attemptService } from '../../services/attemptService';
import { useToast } from '../../components/common/ToastProvider';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useGetAttemptHistoryQuery } from '../../store/userApi';

function getAttemptRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.content)) return response.content;
  return [];
}

export default function StartTestButton({ testId, variant = 'default', locked = false, hasAttempted }) {
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [starting, setStarting] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { data: attemptHistory } = useGetAttemptHistoryQuery(
    { page: 1, perPage: 50 },
    { skip: !user }
  );
  const attemptedByCurrentUser = useMemo(
    () => getAttemptRecords(attemptHistory).some((attempt) =>
      [attempt?.testId, attempt?.testSlug].some((id) => String(id) === String(testId))
    ),
    [attemptHistory, testId]
  );
  const shouldShowRetry = !locked && (hasAttempted ?? attemptedByCurrentUser);

  const handleStart = requireAuth(() => {
    const url = `/tests/${testId}/instructions`;
    const features = 'popup=1,width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes';

    window.open(url, '_blank', features);
  });

  const styles =
    variant === 'outline'
      ? 'w-full gap-1.5 rounded-md border border-brand-600 bg-white px-3 py-2 text-xs text-brand-600 hover:bg-brand-50'
      : variant === 'home'
        ? 'w-full gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm text-white hover:bg-indigo-700'
      : 'w-full gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm text-white hover:bg-indigo-700 sm:w-auto';

  return (
    <button
      type="button"
      disabled={starting || locked}
      onClick={handleStart}
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {locked ? (
        <>START TEST<Lock size={variant === 'outline' ? 13 : 16} aria-hidden="true" /></>
      ) : starting ? (
        <><Loader2 size={16} className="animate-spin" />Starting...</>
      ) : shouldShowRetry ? (
        <>Attempt test again<ArrowRight size={variant === 'outline' ? 13 : 16} /></>
      ) : variant === 'outline' ? (
        <>Start Test<ArrowRight size={13} /></>
      ) : (
        <>Start test<ArrowRight size={16} /></>
      )}
    </button>
  );
}
