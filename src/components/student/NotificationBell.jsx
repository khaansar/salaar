
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Coins, CreditCard, Trophy, BellRing } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '../../lib/apiClient';

const NOTIFICATIONS_PATH = '/notifications-api/notifications';
const MAX_VISIBLE_NOTIFICATIONS = 5;

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

function getStreamUrl() {
  return `${getApiBaseUrl()}${NOTIFICATIONS_PATH}/stream`;
}

function normalizeNotification(notification) {
  return {
    ...notification,
    id: String(notification.id),
    read: Boolean(notification.read),
    createdAt: notification.createdAt || new Date().toISOString(),
  };
}

function getRelativeTime(value) {
  if (!value) return '';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function getNotificationIcon(notification) {
  const eventType = String(notification.eventType || '').toUpperCase();

  if (eventType.includes('PAYMENT')) {
    return <CreditCard size={21} className="text-emerald-500" />;
  }

  if (eventType.includes('ATTEMPT') || eventType.includes('TEST')) {
    return <Trophy size={21} className="text-amber-500" />;
  }

  if (eventType.includes('STREAK')) {
    return <BellRing size={21} className="text-orange-500" />;
  }

  if (eventType.includes('COIN') || eventType.includes('REWARD')) {
    return <Coins size={21} className="text-amber-500" />;
  }

  return <Bell size={21} className="text-sky-500" />;
}

function mergeNotifications(current, incoming) {
  const byId = new Map();

  for (const item of [...incoming, ...current]) {
    if (item?.id) {
      byId.set(String(item.id), normalizeNotification(item));
    }
  }

  return [...byId.values()]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export default function NotificationBell({ userId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const panelRef = useRef(null);
  const eventSourceRef = useRef(null);
  const refreshInFlightRef = useRef(false);

  const refreshNotifications = useCallback(async () => {
    if (!userId || refreshInFlightRef.current) return;

    refreshInFlightRef.current = true;
    setIsLoading(true);
    setLoadError('');

    try {
      const [listResponse, countResponse] = await Promise.all([
        apiClient.get(NOTIFICATIONS_PATH),
        apiClient.get(`${NOTIFICATIONS_PATH}/unread-count`),
      ]);

      const list = Array.isArray(listResponse) ? listResponse : [];
      const count = Number(countResponse);

      setNotifications((current) => mergeNotifications(current, list));
      setUnreadCount(
        Number.isFinite(count)
          ? Math.max(0, count)
          : list.filter((item) => !item.read).length
      );
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error?.message || 'Could not load notifications. Please try again.'
      );
    } finally {
      refreshInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [userId]);

  // Keep one SSE connection per authenticated user.
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return undefined;

    const source = new EventSource(getStreamUrl(), {
      withCredentials: true,
    });

    eventSourceRef.current = source;

    source.addEventListener('notification', (event) => {
      try {
        const incoming = normalizeNotification(JSON.parse(event.data));

        setNotifications((current) => mergeNotifications(current, [incoming]));

        if (!incoming.read) {
          setUnreadCount((count) => count + 1);
        }
      } catch (error) {
        console.error('Unable to parse SSE notification:', error);
      }
    });

    source.onerror = () => {
      // EventSource automatically reconnects. Do not create another stream.
    };

    return () => {
      source.close();
      if (eventSourceRef.current === source) {
        eventSourceRef.current = null;
      }
    };
  }, [userId]);

  // Load persisted notifications on login and when the popup opens.
  useEffect(() => {
    if (userId) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setHasLoaded(false);
    }
  }, [userId, refreshNotifications]);

  useEffect(() => {
    if (isOpen) refreshNotifications();
  }, [isOpen, refreshNotifications]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      // Optimistic update; restore the original state if the API fails.
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await apiClient.patch(
          `${NOTIFICATIONS_PATH}/${encodeURIComponent(notification.id)}/read`
        );
      } catch (error) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read: false } : item
          )
        );
        setUnreadCount((count) => count + 1);
        console.error('Unable to mark notification as read:', error);
      }
    }

    setIsOpen(false);

    const actionUrl = notification.actionUrl;

    // Only navigate to same-origin relative paths from the backend.
    if (
      typeof actionUrl === 'string' &&
      actionUrl.startsWith('/') &&
      !actionUrl.startsWith('//')
    ) {
      router.push(actionUrl);
    }
  };

  const visibleNotifications = notifications.slice(
    0,
    MAX_VISIBLE_NOTIFICATIONS
  );

  if (!userId) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        aria-expanded={isOpen}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-950" />
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-full z-[100] mt-3 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#121316]"
        >
          <header className="flex h-[66px] items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Your latest updates
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-brand-500/15 dark:text-brand-300">
                  {unreadCount > 99 ? '99+' : unreadCount} new
                </span>
              )}

              <button
                type="button"
                onClick={refreshNotifications}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <CheckCheck size={17} />
              </button>
            </div>
          </header>

          {loadError && !hasLoaded ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loadError}
              </p>
              <button
                type="button"
                onClick={refreshNotifications}
                className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex min-h-[150px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Bell size={20} />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                New updates will appear here.
              </p>
            </div>
          ) : (
            <div>
              {visibleNotifications.map((notification, index) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex min-h-[84px] w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''
                  } ${
                    !notification.read
                       ? 'bg-blue-50/50 dark:bg-brand-500/[0.08]'
                      : ''
                  }`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    {getNotificationIcon(notification)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="line-clamp-2 text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">
                        {notification.title || 'Notification'}
                      </span>
                      <span className="shrink-0 pt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                    </span>

                    {notification.message && (
                      <span className="mt-1 block line-clamp-2 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                        {notification.message}
                      </span>
                    )}
                  </span>

                  {!notification.read && (
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600"
                      aria-label="Unread"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <footer className="flex h-10 items-center justify-center border-t border-slate-100 px-4 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Showing the {visibleNotifications.length} most recent
              {notifications.length > MAX_VISIBLE_NOTIFICATIONS
                ? ` of ${notifications.length}`
                : ''}
            </span>
          </footer>
        </section>
      )}
    </div>
  );
}
