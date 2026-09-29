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
    <div className="group bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-md border border-indigo-100 dark:border-indigo-500/20 py-2.5 px-4 mb-8 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
      {/* Subtle animated background hint */}
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      
      <div className="flex items-center gap-3 flex-1 pl-1">
        <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
          <Clock size={16} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-sm">
            {attempt.testTitle}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:inline-block">•</span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-sm text-nowrap">
              In Progress
            </span>
            <div className="w-20 h-1 bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden shrink-0 ml-1">
              <div 
                className="h-full bg-emerald-500 rounded-sm"
                style={{ width: `${attempt.progressPercentage || 0}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {attempt.progressPercentage || 0}%
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => router.push(`/attempt/${attemptId}`)}
        className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center shrink-0 group-hover:scale-[1.02] active:scale-95"
      >
        Resume <ArrowRight size={14} className="ml-1.5" />
      </button>
    </div>
  );
}