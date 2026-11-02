'use client';

import { useCallback, useEffect, useState } from 'react';
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
import CompanionCharacter from './CompanionCharacter';

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

  const stopped = open || leaving;

  return (
    <>
      {open && prompt && (
        <CompanionCard key={prompt.id} prompt={prompt} onClose={close} onSleep={sleep} />
      )}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-52 overflow-hidden">
        <div className={`companion-walk absolute bottom-0 ${stopped ? 'companion-paused' : ''}`}>
          {prompt && !open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="pointer-events-auto mb-1 block whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Quick question?
            </button>
          )}
          <div
            className={`companion-turn flex justify-center ${stopped ? 'companion-idle' : ''} ${leaving ? 'companion-fade' : ''}`}
            onAnimationEnd={(event) => {
              if (event.animationName === 'companion-fade') setLeaving(false);
            }}
          >
            <CompanionCharacter />
          </div>
        </div>
      </div>
    </>
  );
}
