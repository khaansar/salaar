'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import BrandLogo from '@/components/common/BrandLogo';
import {
  resetPassword,
  validatePasswordResetToken,
} from '@/store/slices/authSlice';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const token = searchParams.get('token');

  const {
    resetPasswordStatus,
    passwordResetValidationStatus,
    passwordResetValidationError,
  } = useSelector((state) => state.auth);

  const validationStarted = useRef(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState('');

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const strength = useMemo(() => {
    const score = Object.values(passwordChecks).filter(Boolean).length;

    if (!password) {
      return {
        label: '',
        percentage: 0,
      };
    }

    if (score <= 2) {
      return {
        label: 'Weak',
        percentage: 33,
      };
    }

    if (score <= 4) {
      return {
        label: 'Good',
        percentage: 66,
      };
    }

    return {
      label: 'Strong',
      percentage: 100,
    };
  }, [password, passwordChecks]);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isResetting =
    resetPasswordStatus === 'loading';

  /*
   * Validate the reset token when the page loads.
   *
   * This does NOT reset the password.
   * The actual reset only happens after the user submits
   * the new password.
   */
  useEffect(() => {
    if (validationStarted.current) {
      return;
    }

    validationStarted.current = true;

    if (!token) {
      return;
    }

    dispatch(validatePasswordResetToken(token));
  }, [dispatch, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalError('');

    if (!token) {
      setLocalError(
        'This password reset link is invalid or incomplete. Please request a new one.'
      );
      return;
    }

    if (passwordResetValidationStatus !== 'succeeded') {
      setLocalError(
        'This password reset link is no longer valid. Please request a new one.'
      );
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setLocalError(
        'Please choose a stronger password that meets all requirements.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          newPassword: password,
        })
      ).unwrap();

      setSuccess(true);
    } catch (err) {
      setLocalError(
        typeof err === 'string'
          ? err
          : 'Unable to reset your password. The link may have expired.'
      );
    }
  };

  /*
   * Success state
   */
  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-md">

            <div className="mb-8 flex justify-center">
              <BrandLogo size="lg" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={24} strokeWidth={3} />
                </div>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Password updated
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your password has been successfully changed. You can
                now sign in using your new password.
              </p>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                Continue to login
                <ArrowRight size={17} />
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Your account is secure. You can now continue your preparation.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Missing token / invalid / expired token
   */
  if (
    !token ||
    passwordResetValidationStatus === 'failed'
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-md">

            <div className="mb-8 flex justify-center">
              <BrandLogo size="lg" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertCircle
                  size={32}
                  className="text-red-600 dark:text-red-400"
                />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reset link expired
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {passwordResetValidationError ||
                  'This password reset link is invalid or has expired. Please request a new password reset link.'}
              </p>

              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              >
                Request a new reset link
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Back to login
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure account recovery
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Validating token
   */
  if (
    passwordResetValidationStatus === 'loading' ||
    passwordResetValidationStatus === 'idle'
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-md">

            <div className="mb-8 flex justify-center">
              <BrandLogo size="lg" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
                <Loader2
                  size={28}
                  className="animate-spin text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Checking reset link
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Please wait while we verify that your password reset
                link is still valid.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure account recovery
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Valid reset token — show password form.
   */
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">

          {/* Brand */}
          <div className="mb-8 flex justify-center">
            <BrandLogo size="lg" />
          </div>

          {/* Main card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-9">

            {/* Lock icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
                <LockKeyhole
                  size={26}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create a new password
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Choose a strong password to keep your account secure.
              </p>
            </div>

            {/* Error */}
            {localError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {localError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">

              {/* New password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={isResetting}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={isResetting}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Password strength */}
                {password && (
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Password strength
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          strength.label === 'Strong'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : strength.label === 'Good'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.label === 'Strong'
                            ? 'bg-emerald-500'
                            : strength.label === 'Good'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{
                          width: `${strength.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    disabled={isResetting}
                    className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50'
                        : confirmPassword && passwordsMatch
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-emerald-500/50'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={isResetting}
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {confirmPassword && (
                  <p
                    className={`mt-2 text-xs ${
                      passwordsMatch
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {passwordsMatch
                      ? 'Passwords match'
                      : 'Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />

                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password requirements
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Requirement
                    met={passwordChecks.length}
                    text="At least 8 characters"
                  />

                  <Requirement
                    met={passwordChecks.uppercase}
                    text="One uppercase letter"
                  />

                  <Requirement
                    met={passwordChecks.lowercase}
                    text="One lowercase letter"
                  />

                  <Requirement
                    met={passwordChecks.number}
                    text="One number"
                  />

                  <Requirement
                    met={passwordChecks.special}
                    text="One special character"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isResetting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResetting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
              <LockKeyhole
                size={16}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                For your security, password reset links expire after
                15 minutes.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Secure account recovery
          </p>
        </div>
      </div>
    </main>
  );
}

function Requirement({ met, text }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          met
            ? 'bg-emerald-500 text-white'
            : 'border border-slate-300 dark:border-slate-700'
        }`}
      >
        {met && <Check size={10} strokeWidth={3} />}
      </div>

      <span
        className={`text-xs ${
          met
            ? 'text-slate-700 dark:text-slate-300'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        {text}
      </span>
    </div>
  );
}