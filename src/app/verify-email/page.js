import { Suspense } from 'react';
import VerifyEmailPage from '../../components/auth/VerifyEmailPage';

export default function VerifyEmailRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Verifying your email...
          </div>
        </div>
      }
    >
      <VerifyEmailPage />
    </Suspense>
  );
}