'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';

import { useAppSelector } from '../../hooks/useAppSelector';
import { useMyEntitlements } from '../catalog/useMyEntitlements';
import SeriesCheckoutButton from '../payments/SeriesCheckoutButton';

const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
const BTN_PRIMARY = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 ${FOCUS}`;

/** The user's usable TEST_SERIES entitlement for this series, whether purchased or granted by an admin. */
function findActiveSeriesAccess(entitlements, seriesId) {
  const now = Date.now();
  return entitlements.find((e) =>
    String(e?.status ?? '').toUpperCase() === 'ACTIVE'
    && String(e?.productType ?? '').toUpperCase() === 'TEST_SERIES'
    && String(e?.productReferenceId ?? '') === String(seriesId)
    && (!e?.expiresAt || Date.parse(e.expiresAt) > now)
  );
}

function formatDay(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

/**
 * Price + checkout for a paid series, or an "already unlocked" state when the
 * signed-in user has access, so owners are not asked to buy again.
 */
export default function SeriesPurchasePanel({ seriesId, seriesTitle, priceLabel }) {
  const { user } = useAppSelector((state) => state.auth);
  const { entitlements, isLoading } = useMyEntitlements({ enabled: Boolean(user) });

  if (user && isLoading) {
    return (
      <div aria-busy="true" className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  const access = user ? findActiveSeriesAccess(entitlements, seriesId) : null;

  if (access) {
    return (
      <div>
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <BadgeCheck size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">You have access to this series</p>
            <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
              {access.expiresAt ? `Available until ${formatDay(access.expiresAt)}` : 'Lifetime access'}
            </p>
          </div>
        </div>
        <Link href="#tests" className={`${BTN_PRIMARY} mt-4 w-full py-3`}>
          Start practicing <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-slate-500 dark:text-slate-400">One-time payment</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{priceLabel}</p>
      <div className="mt-5">
        <SeriesCheckoutButton seriesId={seriesId} seriesTitle={seriesTitle} />
      </div>
    </>
  );
}
