'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2 } from 'lucide-react';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { clearAuth } from '../../store/slices/authSlice';
import { apiSlice } from '../../store/apiSlice';
import { userService } from '../../services/userService';

// Matches the backend's default app.otp.resend-cooldown.
const RESEND_COOLDOWN_SECONDS = 60;

export function DeleteAccountSection({ email }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('confirm'); // confirm | code
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setStep('confirm');
    setCode('');
    setError('');
  };

  const sendCode = async () => {
    setError('');
    setSending(true);
    try {
      await userService.requestAccountDeletionCode();
      setStep('code');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      // A code sent moments ago is still valid, so let the user enter it.
      if (err?.code === 'OTP_COOLDOWN') {
        setStep('code');
      }
      setError(err?.message || 'Could not send the confirmation code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const confirmDeletion = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setError('');
    setDeleting(true);
    try {
      await userService.deleteAccount(code);
      dispatch(clearAuth());
      dispatch(apiSlice.util.resetApiState());
      router.replace('/');
    } catch (err) {
      setError(err?.message || 'Could not delete your account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-rose-100 dark:border-rose-500/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Delete account</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Permanently remove your profile and sign out everywhere. This cannot be undone.
            </p>
          </div>
        </div>
        <Button variant="dangerOutline" onClick={() => setOpen(true)} className="shrink-0">
          Delete account
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        width="sm"
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-500" />
            Delete your account?
          </span>
        }
      >
        {step === 'confirm' ? (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your name, contact details and photo will be removed and you will be signed out on every
              device. Purchased access and test history will no longer be available to you.
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              To confirm, we&apos;ll email a 6-digit code to <span className="font-semibold">{email}</span>.
            </p>
            {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={close} disabled={sending}>Cancel</Button>
              <Button variant="danger" onClick={sendCode} isLoading={sending}>Send code</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={confirmDeletion} noValidate>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Enter the code we sent to <span className="font-semibold">{email}</span>.
            </p>
            <div className="mt-4">
              <Input
                id="delete-account-code"
                label="Confirmation code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="button"
              onClick={sendCode}
              disabled={cooldown > 0 || sending}
              className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-indigo-400"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={close} disabled={deleting}>Cancel</Button>
              <Button type="submit" variant="danger" isLoading={deleting}>Delete my account</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
