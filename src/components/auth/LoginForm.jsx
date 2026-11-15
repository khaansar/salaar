'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';

import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';

import { isValidEmail } from '../../utils/validators';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';

import { loginUser, resendVerificationCode } from '../../store/slices/authSlice';
import { startOAuth } from '../../lib/oauth';
import { refreshSession } from '../../lib/apiClient';
import { parseFormError } from '../../lib/formErrors';
import { FormAlert } from './FormAlert';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const dispatch = useAppDispatch();

  const { loginStatus } = useAppSelector((state) => state.auth);

  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get('next');
  const oauthError = searchParams.get('oauth_error');

  const destination =
    nextParam?.startsWith('/') &&
    !nextParam.startsWith('//') &&
    !nextParam.startsWith('/\\')
      ? nextParam
      : '/';

  // A protected page sends visitors here when its short-lived access cookie
  // has expired, even if the refresh token is still valid (for example after
  // reloading an exam). Try a silent refresh first and go straight back.
  const [restoringSession, setRestoringSession] = useState(
    () => Boolean(nextParam) && !oauthError
  );

  useEffect(() => {
    if (!restoringSession) {
      return undefined;
    }

    let active = true;

    refreshSession()
      .then(() => {
        window.location.replace(destination);
      })
      .catch(() => {
        if (active) {
          setRestoringSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, [restoringSession, destination]);

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email';
    }

    if (!password) {
      newErrors.password = 'Required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError(null);

    if (!validate()) {
      return;
    }

    try {
      await dispatch(
        loginUser({
          email,
          password,
        })
      ).unwrap();

      router.push(destination);
      router.refresh();
    } catch (err) {
      if (err?.code === 'EMAIL_NOT_VERIFIED') {
        // Send a fresh code and continue on the verification screen.
        dispatch(resendVerificationCode(email.trim()));
        const params = new URLSearchParams({ email: email.trim() });
        if (destination !== '/') params.set('next', destination);
        router.push(`/verify-email?${params.toString()}`);
        return;
      }

      // Wrong credentials stay a form-level message so we don't reveal which field was wrong.
      const parsed = parseFormError(err, { fallback: 'Login failed. Please try again.' });
      setErrors(parsed.fieldErrors);
      setFormError(parsed.formError);
    }
  };

  const handleOAuthLogin = (provider) => {
    setFormError(null);
    if (!startOAuth(provider, destination)) {
      setFormError("Google sign-in isn't available right now. Please use your email and password.");
    }
  };

  const getOAuthErrorMessage = () => {
    switch (oauthError) {
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';

      case 'account_disabled':
        return 'This account has been deactivated. Contact support if you think this is a mistake.';

      case 'access_denied':
        return 'Authentication was cancelled.';

      case 'account_linking_required':
        return 'This account requires additional verification before you can sign in.';

      default:
        return oauthError
          ? 'Unable to sign in with your selected provider. Please try again.'
          : null;
    }
  };

  const oauthErrorMessage = getOAuthErrorMessage();

  if (restoringSession) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 text-center text-sm text-slate-500 dark:text-slate-400" role="status">
          Restoring your session...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        <div className="p-6 sm:p-8">

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                Welcome Back
              </h2>

              <p className="text-[14px] text-slate-500 dark:text-slate-400">
                Login to continue your preparation.
              </p>
            </div>

            <div className="text-sm sm:text-right mt-2 shrink-0">
              <span className="text-slate-500 dark:text-slate-400">
                New here?{' '}
              </span>

              <Link
                href={
                  destination !== '/'
                    ? `/signup?next=${encodeURIComponent(destination)}`
                    : '/signup'
                }
                className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                Sign Up &rarr;
              </Link>
            </div>
          </div>

          {/* Authentication errors */}
          <FormAlert className="mb-5">{formError || oauthErrorMessage}</FormAlert>

          {/* OAuth providers */}
          <div className="mb-5">

            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex justify-center items-center gap-2 h-11 w-full px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/80 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />

                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />

                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />

                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>

              Continue with Google
            </button>

          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
            </div>

            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Email/password login */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <Input
                id="email"
                label="Email or Phone Number"
                type="email"
                placeholder="Enter your email or phone number"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
                error={errors.email}
                className="h-12"
                leftIcon={<Mail size={18} />}
              />

              <PasswordInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
                error={errors.password}
                className="h-12"
                leftIcon={<Lock size={18} />}
              />
            </div>

            <div className="flex items-center justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-[13px] font-medium text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginStatus === 'loading'}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white transition-all hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loginStatus === 'loading' ? (
                'Signing in...'
              ) : (
                <>
                  Login
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}