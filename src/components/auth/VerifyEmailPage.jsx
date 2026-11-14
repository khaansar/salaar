'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';

import { useAppDispatch } from '../../hooks/useAppDispatch';
import { isValidEmail } from '../../utils/validators';
import {
  resendVerificationCode,
  verifyEmail,
} from '../../store/slices/authSlice';

// Matches the backend's default app.otp.resend-cooldown.
const RESEND_COOLDOWN_SECONDS = 60;

const safeNext = (value) =>
  value?.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
    ? value
    : null;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const initialEmail = searchParams.get('email') || '';
  const next = safeNext(searchParams.get('next'));
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | verifying | success
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    initialEmail ? `We sent a 6-digit code to ${initialEmail}.` : ''
  );
  // A code was just sent when we arrive here from signup or login.
  const [cooldown, setCooldown] = useState(initialEmail ? RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const emailValid = isValidEmail(email.trim());

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailValid) {
      setError('Enter the email address you signed up with.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setStatus('verifying');
    try {
      await dispatch(verifyEmail({ email: email.trim(), code })).unwrap();
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setError(typeof err === 'string' ? err : 'The code is invalid or has expired.');
    }
  };

  const handleResend = async () => {
    setError('');
    if (!emailValid) {
      setError('Enter the email address you signed up with.');
      return;
    }

    try {
      await dispatch(resendVerificationCode(email.trim())).unwrap();
      setCode('');
      setNotice(`If ${email.trim()} needs verification, a new code is on its way.`);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not send a new code. Please try again.');
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[460px]">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
              ClearIt
            </span>
          </Link>
        </div>

        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">

          {status === 'success' ? (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Email verified successfully
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                Your email address has been verified. You can now log in to your ClearIt account.
              </p>

              <Link
                href={loginHref}
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                Continue to Login
              </Link>
            </>
          ) : (
            <form onSubmit={handleVerify} noValidate>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                <MailCheck size={32} className="text-brand-600 dark:text-brand-400" />
              </div>

              <h1 className="text-[26px] font-bold text-slate-900 dark:text-white">
                Verify your email
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                {notice || 'Enter your email and the 6-digit code we sent you.'}
              </p>

              <div className="mt-8 space-y-4 text-left">
                {!initialEmail && (
                  <div>
                    <label htmlFor="verify-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      id="verify-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="verify-code" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Verification code
                  </label>
                  <input
                    id="verify-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center font-mono text-2xl tracking-[0.5em] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'verifying'}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-70"
              >
                {status === 'verifying' && <Loader2 size={18} className="animate-spin" />}
                Verify Email
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="mt-4 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-brand-400 dark:disabled:text-slate-500"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <ShieldCheck size={15} />
                Codes expire after a few minutes and work once
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already verified?{' '}
          <Link href={loginHref} className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
