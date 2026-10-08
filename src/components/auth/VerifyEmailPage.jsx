'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';

import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
  validateEmailVerificationToken,
  verifyEmail,
} from '../../store/slices/authSlice';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const token = searchParams.get('token');

  const validationStarted = useRef(false);

  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (validationStarted.current) {
      return;
    }

    validationStarted.current = true;

    if (!token) {
      setStatus('error');
      setErrorMessage(
        'This verification link is missing its token.'
      );
      return;
    }

    const validate = async () => {
      try {
        await dispatch(
          validateEmailVerificationToken(token)
        ).unwrap();

        setStatus('ready');
      } catch (error) {
        setStatus('error');

        setErrorMessage(
          typeof error === 'string'
            ? error
            : 'This verification link is invalid or has expired.'
        );
      }
    };

    validate();
  }, [dispatch, token]);

  const handleVerify = async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage(
        'This verification link is missing its token.'
      );
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    try {
      await dispatch(verifyEmail(token)).unwrap();

      setStatus('success');
    } catch (error) {
      setStatus('error');

      setErrorMessage(
        typeof error === 'string'
          ? error
          : 'This verification link is invalid or has expired.'
      );
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[460px]">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
          >
            <span className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
              ClearIt
            </span>
          </Link>
        </div>

        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">

          {/* --------------------------------------------- */}
          {/* VALIDATING TOKEN                              */}
          {/* --------------------------------------------- */}

          {status === 'loading' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                <Loader2
                  size={30}
                  className="animate-spin text-brand-600 dark:text-brand-400"
                />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Checking your verification link
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                Please wait while we check that your verification
                link is still valid.
              </p>
            </>
          )}

          {/* --------------------------------------------- */}
          {/* TOKEN VALID — WAITING FOR USER ACTION         */}
          {/* --------------------------------------------- */}

          {status === 'ready' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                <MailCheck
                  size={32}
                  className="text-brand-600 dark:text-brand-400"
                />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Verify your email
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                Your verification link is valid. Click the button
                below to verify your ClearIt account.
              </p>

              <button
                type="button"
                onClick={handleVerify}
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                Verify Email
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <ShieldCheck size={15} />
                Secure one-time verification
              </div>
            </>
          )}

          {/* --------------------------------------------- */}
          {/* VERIFYING                                     */}
          {/* --------------------------------------------- */}

          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                <Loader2
                  size={30}
                  className="animate-spin text-brand-600 dark:text-brand-400"
                />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Verifying your email
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                Please wait while we complete your email verification.
              </p>
            </>
          )}

          {/* --------------------------------------------- */}
          {/* SUCCESS                                       */}
          {/* --------------------------------------------- */}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2
                  size={32}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Email verified successfully
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                Your email address has been verified. You can now
                log in to your ClearIt account.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                Continue to Login
              </Link>
            </>
          )}

          {/* --------------------------------------------- */}
          {/* ERROR                                         */}
          {/* --------------------------------------------- */}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertCircle
                  size={32}
                  className="text-red-600 dark:text-red-400"
                />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Verification failed
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                {errorMessage}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Continue to Login
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Create another account
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <MailCheck size={15} />
          Secure email verification
        </div>
      </div>
    </main>
  );
}