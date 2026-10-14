'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Phone,
  Target,
  Loader2,
  Trash2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { useToast } from '../common/ToastProvider';
import { Avatar } from '../ui/Avatar';
import { PasswordInput } from '../ui/PasswordInput';
import { uploadAvatar } from '../../lib/avatarUpload';
import { userService } from '../../services/userService';
import { validatePassword } from '../../utils/validators';

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

export default function AccountSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, isInitialized } = useAppSelector((state) => state.auth);

  const fileInputRef = useRef(null);

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
      await uploadAvatar(file);
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
      await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        targetExam: targetExam.trim(),
      });

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

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Student';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/profile" className="hover:text-brand-600 transition-colors">
          My Profile
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Account Settings
        </span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Manage your personal profile, target exam preferences, and login security.
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={14} />
          Back to Profile
        </Link>
      </div>

      <div className="space-y-8">
        {/* ========================================================================= */}
        {/* CARD 1: PERSONAL DETAILS & EXAM TARGET                                    */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Details & Exam Target
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your name, profile photo, contact details, and current exam goal.
              </p>
            </div>
          </div>

          {/* Avatar / Profile Picture Management */}
          <div className="mb-8 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Profile Photo
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group shrink-0">
                <Avatar
                  name={fullName}
                  avatarUrl={user?.avatarUrl}
                  size="xl"
                  className="h-20 w-20 ring-4 ring-white dark:ring-slate-800 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  aria-label="Upload profile photo"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-0"
                >
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarSelect}
                    disabled={avatarUploading}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {avatarUploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Uploading photo...
                      </>
                    ) : (
                      <>
                        <Camera size={13} />
                        Change Photo
                      </>
                    )}
                  </button>

                  {user?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarUploading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Recommended: Square JPG, PNG, or WebP. Maximum file size: 5 MB.
                </p>

                {avatarError && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    <AlertCircle size={13} />
                    {avatarError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Success / Error Feedback */}
          {profileSuccess && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">{profileSuccess}</p>
                <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                  Your profile and learning goal have been updated across Salaar.
                </p>
              </div>
            </div>
          )}

          {profileError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="settings-first-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  First Name <span className="text-rose-500">*</span>
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="settings-last-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Email Address (Read-only reference) & Phone Number */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="settings-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Account email address cannot be changed directly.
                </p>
              </div>

              <div>
                <label
                  htmlFor="settings-phone"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative flex rounded-xl border border-slate-200 bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 dark:border-slate-800 dark:bg-slate-950">
                  <span className="inline-flex items-center border-r border-slate-200 px-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400 select-none">
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
                    className="w-full rounded-r-xl bg-transparent px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
                  />
                  <div className="flex items-center pr-3 text-slate-400 pointer-events-none">
                    <Phone size={14} />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Used for exam updates and result notifications.
                </p>
              </div>
            </div>

            {/* Target Exam Section */}
            <div className="pt-2">
              <label
                htmlFor="settings-target-exam"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                <Target size={14} className="text-brand-600 dark:text-brand-400" />
                Target Exam Goal
              </label>

              {/* Quick Select Exam Chips */}
              <div className="mb-3 flex flex-wrap gap-2">
                {POPULAR_EXAMS.map((exam) => {
                  const isSelected = targetExam.trim().toLowerCase() === exam.toLowerCase();
                  return (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => {
                        setTargetExam(exam);
                        setProfileSuccess('');
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        isSelected
                          ? 'border border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/15 dark:text-brand-300 font-bold'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Helps tailor your exam countdown and mock test recommendations.
              </p>
            </div>

            {/* Profile Action Footer */}
            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={profileSaving || !isProfileDirty}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ========================================================================= */}
        {/* CARD 2: PASSWORD & SECURITY                                               */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Password & Security
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ensure your account is protected with a secure and unique password.
                </p>
              </div>
            </div>
          </div>

          {/* Password Success / Error Feedback */}
          {passwordSuccess && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">{passwordSuccess}</p>
                <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                  Your password has been changed. Use your new password on your next login.
                </p>
              </div>
            </div>
          )}

          {passwordError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="settings-current-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition dark:text-brand-400"
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

            {/* New Password & Strength */}
            <div>
              <label
                htmlFor="settings-new-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                New Password <span className="text-rose-500">*</span>
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

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      Password strength:
                    </span>
                    <span
                      className={`font-bold ${
                        strengthScore >= 4
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : strengthScore >= 3
                          ? 'text-blue-600 dark:text-blue-400'
                          : strengthScore >= 2
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all ${
                          strengthScore >= step
                            ? strengthColors[strengthScore]
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      {hasMinLength ? (
                        <Check size={12} className="text-emerald-500 stroke-[3]" />
                      ) : (
                        <X size={12} className="text-slate-300 dark:text-slate-600" />
                      )}
                      <span>At least 8 characters</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {hasUppercase ? (
                        <Check size={12} className="text-emerald-500 stroke-[3]" />
                      ) : (
                        <X size={12} className="text-slate-300 dark:text-slate-600" />
                      )}
                      <span>At least one uppercase letter (A-Z)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {hasLowercase ? (
                        <Check size={12} className="text-emerald-500 stroke-[3]" />
                      ) : (
                        <X size={12} className="text-slate-300 dark:text-slate-600" />
                      )}
                      <span>At least one lowercase letter (a-z)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {hasNumber ? (
                        <Check size={12} className="text-emerald-500 stroke-[3]" />
                      ) : (
                        <X size={12} className="text-slate-300 dark:text-slate-600" />
                      )}
                      <span>At least one number (0-9)</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="settings-confirm-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Confirm New Password <span className="text-rose-500">*</span>
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
                <p className="mt-1.5 flex items-center gap-1 text-[11px]">
                  {passwordsMatch ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Check size={12} className="stroke-[3]" /> Passwords match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-500 font-medium">
                      <X size={12} /> Passwords do not match
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Password Action Footer */}
            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={
                  passwordSaving ||
                  !currentPassword ||
                  strengthScore < 4 ||
                  !passwordsMatch
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
