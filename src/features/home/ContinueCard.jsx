'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play, Clock } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useEffect, useState } from 'react';
import { catalogService } from '../../services/catalogService';

export default function ContinueCard() {
  const { user, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  const isAuthenticated = isInitialized && !!user;

  const router = useRouter();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContinueAttempt() {
      if (!isAuthenticated) {
        setAttempt(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await catalogService.getContinueAttempt();

        if (!cancelled) {
          setAttempt(data || null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Failed to load in-progress attempt',
            error
          );
          setAttempt(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContinueAttempt();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || loading || !attempt) {
    return null;
  }

  const attemptId =
    attempt.attemptId ||
    attempt.id ||
    attempt.testId;

  if (!attemptId) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-1 mb-12 shadow-md">
      <div className="bg-indigo-600 dark:bg-slate-900 rounded-[22px] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-white">
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-1">
            <Clock size={16} />
            <span>In Progress Attempt</span>
          </div>

          <h3 className="text-xl font-bold mb-3">
            {attempt.testTitle}
          </h3>

          <div className="flex items-center gap-4 max-w-sm">
            <div className="flex-1 h-2 bg-indigo-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: `${attempt.progressPercentage || 0}%`,
                }}
              />
            </div>

            <span className="text-sm font-semibold text-indigo-200">
              {attempt.progressPercentage || 0}% Complete
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            router.push(`/attempt/${attemptId}`)
          }
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl transition-colors shrink-0"
        >
          <Play
            size={18}
            className="mr-2 fill-current"
          />

          Resume Test
        </button>
      </div>
    </div>
  );
}