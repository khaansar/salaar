'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

import { useRequireAuth } from '../../hooks/useRequireAuth';
import { attemptService } from '../../services/attemptService';
import { useToast } from '../../components/common/ToastProvider';

// `variant` is the only addition (UI only). Default look and behaviour are unchanged.
export default function StartTestButton({ testId, durationMinutes, variant = 'default' }) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [starting, setStarting] = useState(false);

  const handleStart = requireAuth(() => {
    const url = `/tests/${testId}/instructions`;
    const features = 'popup=1,width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes';

    window.open(url, '_blank', features);
  });

  const styles =
    variant === 'outline'
      ? 'w-full gap-1.5 rounded-md border border-brand-600 bg-white px-3 py-2 text-xs text-brand-600 hover:bg-brand-50'
      : 'w-full gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm text-white hover:bg-indigo-700 sm:w-auto';

  return (
    <button
      type="button"
      disabled={starting}
      onClick={handleStart}
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {starting ? (
        <><Loader2 size={16} className="animate-spin" />Starting...</>
      ) : variant === 'outline' ? (
        <>Start Test<ArrowRight size={13} /></>
      ) : (
        <>Start test<ArrowRight size={16} /></>
      )}
    </button>
  );
}