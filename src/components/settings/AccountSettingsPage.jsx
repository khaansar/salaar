'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Camera,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Phone,
  Target,
  Loader2,
  Trash2,
  Check,
  X,
  Mail,
} from 'lucide-react';

import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchCurrentUser, updateUser } from '../../store/slices/authSlice';
import { useToast } from '../common/ToastProvider';
import { Avatar } from '../ui/Avatar';
import { PasswordInput } from '../ui/PasswordInput';
import { uploadAvatar } from '../../lib/avatarUpload';
import { userService } from '../../services/userService';
import { validatePassword } from '../../utils/validators';
import BackButton from '../common/BackButton';

const POPULAR_EXAMS = [
  'SSC CGL 2025',
  'UPSC CSE',
  'IBPS PO / Clerk',
  'SBI PO',
  'RRB NTPC',
  'JEE Main',
  'NEET UG',
  'State PSC',
  'GATE',
  'CDS / NDA',
];

/* ---------- Theme tokens (light / dark pairs) ---------- */
const T = {
  card: 'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
  inset: 'rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40',
  divider: 'border-slate-200 dark:border-slate-800',
  text: 'text-slate-900 dark:text-slate-50',
  body: 'text-slate-700 dark:text-slate-300',
  muted: 'text-slate-500 dark:text-slate-400',
  focus:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
};

const INPUT =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500';
const LABEL = 'mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200';
const HINT = 'mt-1.5 text-xs text-slate-500 dark:text-slate-400';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-400 dark:text-slate-950';

/* ---------- Small building blocks ---------- */
function Alert({ tone, title, children }) {
  const success = tone === 'success';
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
        success
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
          : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-0.5 opacity-90">{children}</p>}
      </div>
    </div>
  );
}

function SectionCard({ id, icon: Icon, tone = 'brand', title, description, children }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  };
  return (
    <section id={id} className={`${T.card} scroll-mt-6`}>
      <header className={`flex items-center gap-3.5 border-b px-6 py-5 sm:px-8 ${T.divider}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={20} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className={`text-base font-semibold ${T.text}`}>{title}</h2>
          <p className={`text-sm ${T.muted}`}>{description}</p>
        </div>
      </header>
      <div className="space-y-6 px-6 py-6 sm:px-8">{children}</div>
    </section>
  );
}

function Requirement({ met, children }) {
  return (
    <li className={`flex items-center gap-2 ${met ? 'text-slate-800 dark:text-slate-200' : T.muted}`}>
      {met ? (
        <Check size={14} className="shrink-0 stroke-[3] text-emerald-600 dark:text-emerald-400" aria-hidden />
      ) : (
        <X size={14} className="shrink-0 text-slate-400 dark:text-slate-600" aria-hidden />
      )}
      <span>{children}</span>
      <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
    </li>
  );
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, isInitialized } = useAppSelector((state) => state.auth);

  const fileInputRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  // Close the photo menu on outside click or Escape
  useEffect(() => {
    if (!avatarMenuOpen) return undefined;
    const onPointerDown = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setAvatarMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [avatarMenuOpen]);

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Avatar Upload States
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Redirect to login if not logged in
  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login?next=/settings');
    }
  }, [isInitialized, user, router]);

  // Synchronize state with current user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setTargetExam(user.targetExam || '');
    }
  }, [user]);

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Compute password strength score (0 to 4)
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-slate-200 dark:bg-slate-700',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  // Has profile changed?
  const isProfileDirty =
    firstName.trim() !== (user?.firstName || '') ||
    lastName.trim() !== (user?.lastName || '') ||
    phone.trim() !== (user?.phone || '') ||
    targetExam.trim() !== (user?.targetExam || '');

  // Handle Avatar Upload
  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAvatarError('');
    setAvatarUploading(true);

    try {
      const res = await uploadAvatar(file);
      if (res?.avatarUrl) {
        dispatch(updateUser({ avatarUrl: res.avatarUrl }));
      }
      await dispatch(fetchCurrentUser());
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      const msg = err?.message || 'Failed to upload profile photo.';
      setAvatarError(msg);
      toast.error(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = async () => {
    setAvatarError('');
    setAvatarUploading(true);

    try {
      await userService.removeAvatar();
      dispatch(updateUser({ avatarUrl: null }));
      await dispatch(fetchCurrentUser());
      toast.success('Profile photo removed.');
    } catch (err) {
      const msg = err?.message || 'Failed to remove profile photo.';
      setAvatarError(msg);
      toast.error(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!firstName.trim()) {
      setProfileError('First name is required.');
      return;
    }

    setProfileSaving(true);

    try {
      const updated = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        targetExam: targetExam.trim(),
      });

      if (updated) {
        dispatch(updateUser(updated));
      }
      await dispatch(fetchCurrentUser());
      setProfileSuccess('Profile changes saved successfully!');
      toast.success('Profile updated successfully!');
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        'Failed to save profile changes. Please try again.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    const validationMsg = validatePassword(newPassword);
    if (validationMsg) {
      setPasswordError(validationMsg);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setPasswordSaving(true);

    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        'Failed to update password. Please check your current password and try again.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
        <span className="sr-only">Loading settings</span>
      </div>
    );
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Student';

  const navLink = `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${T.body} transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 pb-8 pt-2 sm:px-8 lg:px-10">
      {/* Page Header */}
      <div className="mb-6">
        <BackButton
          fallbackHref="/profile"
          className={`mb-2 inline-flex items-center gap-1.5 rounded-md py-1 pr-1 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-brand-300 ${T.focus}`}
          iconSize={14}
        />
        <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${T.text}`}>Account Settings</h1>
        <p className={`mt-1.5 text-sm ${T.muted}`}>
          Manage your personal profile, target exam preferences, and login security.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
        {/* ---------- Sidebar: identity + in-page navigation ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className={`${T.card} flex items-center gap-4 p-5 lg:flex-col lg:text-center`}>
            <Avatar
              name={fullName}
              avatarUrl={user?.avatarUrl}
              size="xl"
              className="h-16 w-16 shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 lg:h-24 lg:w-24"
            />
            <div className="min-w-0">
              <p className={`truncate text-base font-semibold ${T.text}`}>{fullName}</p>
              <p className={`truncate text-sm ${T.muted}`}>{user?.email}</p>
              {user?.targetExam && (
                <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200">
                  <Target size={12} aria-hidden />
                  <span className="truncate">{user.targetExam}</span>
                </p>
              )}
            </div>
          </div>

          <nav
            aria-label="Settings sections"
            className={`${T.card} flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible`}
          >
            <a href="#profile" className={navLink}>Personal details</a>
            <a href="#exam" className={navLink}>Target exam</a>
            <a href="#security" className={navLink}>Password &amp; security</a>
          </nav>
        </aside>

        {/* ---------- Main content ---------- */}
        <div className="min-w-0 space-y-6">
          {/* CARD 1: PERSONAL DETAILS & EXAM TARGET */}
          <SectionCard
            id="profile"
            icon={User}
            title="Personal Details & Exam Target"
            description="Update your name, profile photo, contact details, and current exam goal."
          >
            {/* Avatar / Profile Picture Management */}
            <div className={`${T.inset} flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5`}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarSelect}
                disabled={avatarUploading}
                className="hidden"
              />

              <div ref={avatarMenuRef} className="group relative shrink-0 self-start sm:self-auto">
                <Avatar
                  name={fullName}
                  avatarUrl={user?.avatarUrl}
                  size="xl"
                  className="h-24 w-24 shadow-sm ring-4 ring-white dark:ring-slate-800"
                />

                {/* Pencil overlay: appears on hover / focus (always visible on touch screens) */}
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen((open) => !open)}
                  disabled={avatarUploading}
                  aria-label="Edit profile photo"
                  aria-haspopup="menu"
                  aria-expanded={avatarMenuOpen}
                  className={`absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/55 text-white transition-opacity focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:bg-transparent ${
                    avatarMenuOpen || avatarUploading ? 'opacity-100' : 'opacity-0'
                  } ${T.focus}`}
                >
                  {avatarUploading ? (
                    <Loader2 size={22} className="animate-spin" aria-hidden />
                  ) : (
                    <Pencil size={20} aria-hidden className="[@media(hover:none)]:hidden" />
                  )}
                </button>

                {/* Touch devices have no hover, so show a small pencil badge instead */}
                {!avatarUploading && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 right-0 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white dark:border-slate-800 dark:bg-brand-500 dark:text-slate-950 [@media(hover:none)]:flex"
                  >
                    <Pencil size={14} />
                  </span>
                )}

                {avatarMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Profile photo options"
                    className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium ${T.body} hover:bg-slate-100 dark:hover:bg-slate-800 ${T.focus}`}
                    >
                      <Camera size={15} aria-hidden />
                      Change photo
                    </button>
                    {user?.avatarUrl && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          handleRemoveAvatar();
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 ${T.focus}`}
                      >
                        <Trash2 size={15} aria-hidden />
                        Delete photo
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <p className={`text-sm font-semibold ${T.text}`}>Profile photo</p>
                <p className={`text-sm ${T.muted}`}>
                  Use the pencil on your photo to change or delete it.
                </p>
                <p className={`text-xs ${T.muted}`}>
                  Recommended: Square JPG, PNG, or WebP. Maximum file size: 5 MB.
                </p>

                {avatarError && (
                  <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-rose-700 dark:text-rose-300">
                    <AlertCircle size={14} />
                    {avatarError}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Success / Error Feedback */}
            {profileSuccess && (
              <Alert tone="success" title={profileSuccess}>
                Your profile and learning goal have been updated across Salaar.
              </Alert>
            )}
            {profileError && <Alert tone="error" title={profileError} />}

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* First & Last Name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-first-name" className={LABEL}>
                    First Name <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <input
                    id="settings-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setProfileSuccess('');
                    }}
                    placeholder="e.g. Rohit"
                    required
                    className={INPUT}
                  />
                </div>

                <div>
                  <label htmlFor="settings-last-name" className={LABEL}>
                    Last Name
                  </label>
                  <input
                    id="settings-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setProfileSuccess('');
                    }}
                    placeholder="e.g. Sharma"
                    className={INPUT}
                  />
                </div>
              </div>

              {/* Email Address (Read-only reference) & Phone Number */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="settings-email" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                      Email Address
                    </label>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <CheckCircle2 size={12} aria-hidden /> Verified
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="settings-email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 pr-10 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
                    />
                    <Mail size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
                  </div>
                  <p className={HINT}>Account email address cannot be changed directly.</p>
                </div>

                <div>
                  <label htmlFor="settings-phone" className={LABEL}>
                    Phone Number
                  </label>
                  <div className="relative flex rounded-xl border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950">
                    <span className="inline-flex select-none items-center border-r border-slate-300 px-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-400">
                      +91
                    </span>
                    <input
                      id="settings-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                        setProfileSuccess('');
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full rounded-r-xl bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-500"
                    />
                    <div className="pointer-events-none flex items-center pr-3 text-slate-400">
                      <Phone size={15} aria-hidden />
                    </div>
                  </div>
                  <p className={HINT}>Used for exam updates and result notifications.</p>
                </div>
              </div>

              {/* Target Exam Section */}
              <div id="exam" className={`scroll-mt-6 border-t pt-6 ${T.divider}`}>
                <label htmlFor="settings-target-exam" className={`${LABEL} flex items-center gap-1.5`}>
                  <Target size={15} className="text-brand-600 dark:text-brand-400" aria-hidden />
                  Target Exam Goal
                </label>

                {/* Quick Select Exam Chips */}
                <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Popular exams">
                  {POPULAR_EXAMS.map((exam) => {
                    const isSelected = targetExam.trim().toLowerCase() === exam.toLowerCase();
                    return (
                      <button
                        key={exam}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setTargetExam(exam);
                          setProfileSuccess('');
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${T.focus} ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50 font-semibold text-brand-800 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-200'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" aria-hidden />}
                        {exam}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input for Target Exam */}
                <input
                  id="settings-target-exam"
                  type="text"
                  value={targetExam}
                  onChange={(e) => {
                    setTargetExam(e.target.value);
                    setProfileSuccess('');
                  }}
                  placeholder="Or type another target exam (e.g. State Police SI, CAT, CLAT)..."
                  className={INPUT}
                />
                <p className={HINT}>Helps tailor your exam countdown and mock test recommendations.</p>
              </div>

              {/* Profile Action Footer */}
              <div className={`flex flex-wrap items-center justify-end gap-4 border-t pt-5 ${T.divider}`}>
                {isProfileDirty && !profileSaving && (
                  <span className={`mr-auto text-sm ${T.muted}`}>You have unsaved changes</span>
                )}
                <button type="submit" disabled={profileSaving || !isProfileDirty} className={BTN_PRIMARY}>
                  {profileSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Profile Changes'
                  )}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* CARD 2: PASSWORD & SECURITY */}
          <SectionCard
            id="security"
            icon={Lock}
            tone="amber"
            title="Password & Security"
            description="Ensure your account is protected with a secure and unique password."
          >
            {/* Password Success / Error Feedback */}
            {passwordSuccess && (
              <Alert tone="success" title={passwordSuccess}>
                Your password has been changed. Use your new password on your next login.
              </Alert>
            )}
            {passwordError && <Alert tone="error" title={passwordError} />}

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="max-w-xl">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="settings-current-password" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    Current Password <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className={`rounded text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300 ${T.focus}`}
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="settings-current-password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New + Confirm side by side on wide screens */}
              <div className={`grid gap-5 border-t pt-6 lg:grid-cols-2 ${T.divider}`}>
                {/* New Password & Strength */}
                <div>
                  <label htmlFor="settings-new-password" className={LABEL}>
                    New Password <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <PasswordInput
                    id="settings-new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    placeholder="Enter new strong password"
                    required
                  />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="settings-confirm-password" className={LABEL}>
                    Confirm New Password <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <PasswordInput
                    id="settings-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    placeholder="Re-enter your new password"
                    required
                  />

                  {confirmPassword && (
                    <p className="mt-1.5 text-sm" aria-live="polite">
                      {passwordsMatch ? (
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                          <Check size={14} className="stroke-[3]" aria-hidden /> Passwords match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-300">
                          <X size={14} aria-hidden /> Passwords do not match
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className={`${T.inset} space-y-3 p-4`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${T.muted}`}>Password strength</span>
                    <span
                      className={`font-semibold ${
                        strengthScore >= 4
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : strengthScore >= 3
                          ? 'text-blue-700 dark:text-blue-300'
                          : strengthScore >= 2
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5" aria-hidden>
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all ${
                          strengthScore >= step
                            ? strengthColors[strengthScore]
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <ul className="grid grid-cols-1 gap-2 pt-1 text-sm sm:grid-cols-2">
                    <Requirement met={hasMinLength}>At least 8 characters</Requirement>
                    <Requirement met={hasUppercase}>At least one uppercase letter (A-Z)</Requirement>
                    <Requirement met={hasLowercase}>At least one lowercase letter (a-z)</Requirement>
                    <Requirement met={hasNumber}>At least one number (0-9)</Requirement>
                  </ul>
                </div>
              )}

              {/* Password Action Footer */}
              <div className={`flex items-center justify-end border-t pt-5 ${T.divider}`}>
                <button
                  type="submit"
                  disabled={
                    passwordSaving ||
                    !currentPassword ||
                    strengthScore < 4 ||
                    !passwordsMatch
                  }
                  className={BTN_PRIMARY}
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}