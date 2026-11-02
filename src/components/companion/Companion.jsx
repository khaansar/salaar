'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '../../hooks/useAppSelector';
import { companionService } from '../../services/companionService';
import CompanionCard from './CompanionCard';
import CompanionCharacter from './CompanionCharacter';

const FIRST_CHECK_MS = 20000;
const CHECK_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_COMPANION_POLL_MS) || 300000;
const CHANNEL = 'clearit-companion';
const TEST_STARTED = 'test-started';
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
  const [leaving, setLeaving] = useState(false);

  const visible = Boolean(user) && !isHiddenPath(pathname);
  const onLiveTest = LIVE_TEST_PATH.test(pathname);
  const hasPrompt = Boolean(prompt);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;

    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = ({ data }) => {
      if (data === TEST_STARTED) {
        setPrompt(null);
        setOpen(false);
      }
    };
    if (onLiveTest) channel.postMessage(TEST_STARTED);

    return () => channel.close();
  }, [onLiveTest]);

  useEffect(() => {
    if (!visible || hasPrompt) return undefined;

    const check = () =>
      companionService
        .getNext()
        .then((response) => setPrompt(response?.prompt ?? null))
        .catch(() => setPrompt(null));

    const firstCheck = setTimeout(check, FIRST_CHECK_MS);
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(firstCheck);
      clearInterval(interval);
    };
  }, [visible, hasPrompt]);

  if (!visible || (!prompt && !leaving)) return null;

  const close = () => {
    setPrompt(null);
    setOpen(false);
    setLeaving(true);
  };

  const walkClass = leaving ? 'right-6 companion-exit' : open ? 'right-6' : 'companion-walk';

  return (
    <>
      {open && prompt && <CompanionCard key={prompt.id} prompt={prompt} onClose={close} />}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-52 overflow-hidden">
        <div
          className={`absolute bottom-0 ${walkClass}`}
          onAnimationEnd={(event) => {
            if (event.animationName === 'companion-exit') setLeaving(false);
          }}
        >
          {!leaving && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="pointer-events-auto mb-1 block whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow dark:bg-slate-800 dark:text-slate-100"
            >
              Quick question?
            </button>
          )}
          <div className={open ? 'companion-idle flex justify-center' : 'companion-turn flex justify-center'}>
            <CompanionCharacter />
          </div>
        </div>
      </div>
    </>
  );
}
