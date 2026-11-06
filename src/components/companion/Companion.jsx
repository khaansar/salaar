'use client';

import { useCallback, useEffect, useState } from 'react';
import { EyeOff } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  COMPANION_CHANNEL,
  COMPANION_SETTINGS_CHANGED,
  COMPANION_TEST_STARTED,
  announceToCompanion,
  companionService,
} from '../../services/companionService';
import CompanionCard from './CompanionCard';
import CompanionWalker from './CompanionWalker';

const FIRST_CHECK_MS = 2000;
const CHECK_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_COMPANION_POLL_MS) || 300000;
const LIVE_TEST_PATH = /^\/attempt\/[^/]+\/?$/;
const HIDDEN_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/admin-dashboard',
];

// Durations offered by the hover "Hide" control on the companion.
const HIDE_OPTIONS = [
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hr' },
  { minutes: 24 * 60, label: '1 day' },
];

function HideMenu({ onHide, busy, failed }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap pb-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
      <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/95 py-0.5 pl-2 pr-0.5 text-[11px] font-medium text-slate-600 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300">
        <EyeOff size={12} className="mr-0.5 shrink-0" aria-hidden="true" />
        <span className="mr-0.5">{failed ? 'Try again' : 'Hide'}</span>
        {HIDE_OPTIONS.map((option) => (
          <button
            key={option.minutes}
            type="button"
            disabled={busy}
            onClick={() => onHide(option.minutes)}
            aria-label={`Hide companion for ${option.label}`}
            className="rounded-full px-2 py-0.5 transition-colors hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const isHiddenPath = (pathname) =>
  LIVE_TEST_PATH.test(pathname) ||
  HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export default function Companion() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [prompt, setPrompt] = useState(null);
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [hideFailed, setHideFailed] = useState(false);

  const visible = Boolean(user) && !isHiddenPath(pathname);
  const onLiveTest = LIVE_TEST_PATH.test(pathname);
  const hasPrompt = Boolean(prompt);

  const check = useCallback(
    () =>
      companionService
        .getNext()
        .then((response) => {
          setPresent(Boolean(response?.visible));
          setPrompt(response?.prompt ?? null);
        })
        .catch(() => {
          setPresent(false);
          setPrompt(null);
        }),
    []
  );

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;

    const channel = new BroadcastChannel(COMPANION_CHANNEL);
    channel.onmessage = ({ data }) => {
      if (data === COMPANION_TEST_STARTED) {
        setPrompt(null);
        setOpen(false);
        setPresent(false);
      }
      if (data === COMPANION_SETTINGS_CHANGED) check();
    };

    return () => channel.close();
  }, [check]);

  useEffect(() => {
    if (onLiveTest) announceToCompanion(COMPANION_TEST_STARTED);
  }, [onLiveTest]);

  useEffect(() => {
    if (!visible || hasPrompt) return undefined;

    const firstCheck = setTimeout(check, FIRST_CHECK_MS);
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(firstCheck);
      clearInterval(interval);
    };
  }, [visible, hasPrompt, check]);

  if (!visible || (!present && !leaving)) return null;

  const close = () => {
    setPrompt(null);
    setOpen(false);
  };

  const sleep = () => {
    setPrompt(null);
    setOpen(false);
    setPresent(false);
    setLeaving(true);
  };

  // Uses the backend sleep setting, so the hide applies across tabs and devices.
  const hideFor = (minutes) => {
    setHiding(true);
    setHideFailed(false);
    companionService
      .updateSettings({ sleepMinutes: minutes })
      .then(() => {
        setHovering(false);
        sleep();
      })
      .catch(() => setHideFailed(true))
      .finally(() => setHiding(false));
  };

  return (
    <>
      {open && prompt && (
        <CompanionCard key={prompt.id} prompt={prompt} onClose={close} onSleep={sleep} />
      )}
      <CompanionWalker
        stopped={open || leaving || hovering}
        leaving={leaving}
        onLeft={() => setLeaving(false)}
        onHoverChange={setHovering}
        overlay={leaving ? null : <HideMenu onHide={hideFor} busy={hiding} failed={hideFailed} />}
      >
        {prompt && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto mx-auto mb-1 block whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Quick question?
          </button>
        )}
      </CompanionWalker>
    </>
  );
}
