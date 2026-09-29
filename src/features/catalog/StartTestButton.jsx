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

  const handleStart = requireAuth(() => {
    // Open instructions page in a new clean window
    const url = `/tests/${testId}/instructions`;
    const features = 'popup=1,width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes';
    
    window.open(url, '_blank', features);
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
