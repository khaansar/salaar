'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

import { useRequireAuth } from '../../hooks/useRequireAuth';
import { attemptService } from '../../services/attemptService';
import { useToast } from '../../components/common/ToastProvider';

export default function StartTestButton({
  testId,
  durationMinutes,
}) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [starting, setStarting] = useState(false);

  const handleStart = requireAuth(async () => {
    if (starting) return;

    setStarting(true);

    try {
      const attempt = await attemptService.startAttempt(
        testId,
        durationMinutes || 180
      );

      if (!attempt?.attemptId) {
        throw new Error('The server did not return an attempt ID.');
      }

      router.push(`/attempt/${attempt.attemptId}`);
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to start the test. Please try again.'
      );
      setStarting(false);
    }
  });

  return (
    <button
      type="button"
      disabled={starting}
      onClick={handleStart}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {starting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Starting...
        </>
      ) : (
        <>
          Start test
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}
