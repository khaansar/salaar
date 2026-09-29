'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/common/ToastProvider';

export default function InstructionsClient({ testId, durationMinutes, disabled }) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleBegin = requireAuth(async () => {
    if (!agreed || starting) return;

    setStarting(true);

    try {
      // 1. Request Fullscreen first (must be synchronous with user click in many browsers)
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed or was denied:', err);
        });
      }

      // 2. Call API to start the attempt
      const attempt = await attemptService.startAttempt(testId, durationMinutes);

      if (!attempt?.attemptId) {
        throw new Error('The server did not return an attempt ID.');
      }

      // 3. Navigate to the actual test shell (which will now open in this same fullscreen window)
      router.replace(`/attempt/${attempt.attemptId}`);
    } catch (error) {
      toast.error(error?.message || 'Unable to start the test. Please try again.');
      setStarting(false);
      // Exit fullscreen if it failed to start
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  if (disabled) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={starting}
          />
          <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
          <svg
            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          I have read and understood the instructions.
        </span>
      </label>

      <button
        type="button"
        disabled={!agreed || starting}
        onClick={handleBegin}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {starting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Starting Exam...
          </>
        ) : (
          'Ready to Begin'
        )}
      </button>
    </div>
  );
}
