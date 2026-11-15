'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Eye,
  Pencil,
  Plus,
  Search,
  Ticket,
} from 'lucide-react';

import { useGetAdminCouponRedemptionsQuery, useGetAdminCouponsQuery, useSetAdminCouponEnabledMutation } from '@/store/adminApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination, zeroBasedMeta } from '@/components/ui/Pagination';
import {
  ADMIN_TABLE,
  IconAction,
  InlineAlert,
  StatusBadge,
} from '@/components/admin/AdminUi';
import {
  errorMessage,
  formatDate,
  formatMoney,
  shortId,
} from '@/components/admin/paymentFormat';

const PAGE_SIZE = 20;
const NEW_PATH = '/admin-dashboard/coupons/new';

const STATE_STYLES = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  SCHEDULED: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300',
  USED_UP: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  EXPIRED: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  DISABLED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
};

const REDEMPTION_STYLES = {
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  RESERVED: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  RELEASED: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

/* ------------------------------------------------------------------ helpers */

function couponState(c, now = Date.now()) {
  if (c.status === 'DISABLED') return 'DISABLED';
  if (now < new Date(c.startsAt).getTime()) return 'SCHEDULED';
  if (now >= new Date(c.expiresAt).getTime()) return 'EXPIRED';
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return 'USED_UP';
  return 'ACTIVE';
}

function discountLabel({ discountType, discountValue, maximumDiscountAmount }) {
  if (discountType === 'PERCENTAGE') {
    const pct = `${Number((discountValue / 100).toFixed(2))}% off`;
    return maximumDiscountAmount ? `${pct} · up to ${formatMoney(maximumDiscountAmount)}` : pct;
  }
  return `${formatMoney(discountValue)} off`;
}

/* --------------------------------------------------------------- components */

function RedemptionsDrawer({ coupon, onClose }) {
  const [page, setPage] = useState(0);
  const { currentData, isLoading, isFetching, isError, error } = useGetAdminCouponRedemptionsQuery({ id: coupon.id, page, size: PAGE_SIZE });
  const rows = currentData?.content || [];

  return (
    <Drawer open onClose={onClose} width="2xl" title={`${coupon.code} redemptions`} description={`${coupon.usedCount}${coupon.usageLimit != null ? ` of ${coupon.usageLimit}` : ''} uses counted`}>
      {isError ? (
        <InlineAlert title="Unable to load redemptions">{errorMessage(error)}</InlineAlert>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className={ADMIN_TABLE.table}>
            <thead>
              <tr className={ADMIN_TABLE.headRow}>
                <th className={ADMIN_TABLE.th}>User</th>
                <th className={ADMIN_TABLE.th}>Order</th>
                <th className={ADMIN_TABLE.th}>Saved</th>
                <th className={ADMIN_TABLE.th}>Status</th>
                <th className={ADMIN_TABLE.th}>When</th>
              </tr>
            </thead>
            <tbody className={ADMIN_TABLE.body}>
              {isLoading ? (
                <tr><td colSpan={5}><TableSkeleton rows={4} cols={5} /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={<Ticket size={20} />} title="Not used yet" description="Redemptions appear here once customers apply this code at checkout." /></td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className={ADMIN_TABLE.row}>
                    <td className={`${ADMIN_TABLE.td} font-mono text-xs`} title={r.userId}>{shortId(r.userId)}</td>
                    <td className={`${ADMIN_TABLE.td} font-mono text-xs`} title={r.orderId}>{shortId(r.orderId)}</td>
                    <td className={`${ADMIN_TABLE.td} font-semibold`}>{formatMoney(r.discountAmount)}</td>
                    <td className={ADMIN_TABLE.td}><StatusBadge status={r.status} styles={REDEMPTION_STYLES} /></td>
                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs`}>{formatDate(r.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {(currentData?.totalPages || 0) > 1 && (
            <Pagination
              meta={zeroBasedMeta({ page, totalPages: currentData.totalPages, totalElements: currentData.totalElements, pageSize: PAGE_SIZE })}
              onPageChange={(next) => setPage(Math.max(0, next - 1))}
              disabled={isFetching}
            />
          )}
        </div>
      )}
    </Drawer>
  );
}

function EnableSwitch({ coupon }) {
  const toast = useToast();
  const [setEnabled, { isLoading }] = useSetAdminCouponEnabledMutation();
  const enabled = coupon.status !== 'DISABLED';

  const flip = async () => {
    try {
      await setEnabled({ id: coupon.id, enabled: !enabled }).unwrap();
      toast.success(`${coupon.code} ${enabled ? 'disabled' : 'enabled'}.`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`${enabled ? 'Disable' : 'Enable'} ${coupon.code}`}
      title={enabled ? 'Enabled — click to disable' : 'Disabled — click to enable'}
      onClick={flip}
      disabled={isLoading}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function UsageMeter({ used, limit }) {
  if (limit == null) {
    return <span className="text-xs text-slate-600 dark:text-slate-300">{used} <span className="text-slate-400">/ ∞</span></span>;
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="w-28">
      <p className="text-xs text-slate-600 dark:text-slate-300">{used} <span className="text-slate-400">/ {limit}</span></p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState(null);

  const { currentData, isLoading, isFetching, isError, error, refetch } = useGetAdminCouponsQuery({ q: debounced.trim() || undefined, page, size: PAGE_SIZE });
  const coupons = currentData?.content || [];

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.error('Copy failed — select the code manually.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Coupons' }]}
        title="Coupons"
        subtitle="Create discount codes, control when and how often they apply, and see who used them."
        actions={<Button onClick={() => router.push(NEW_PATH)}><Plus size={16} className="mr-1.5" /> New coupon</Button>}
      />

      <Card>
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="max-w-sm">
            <Input
              aria-label="Search coupons"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by code"
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        {isError && (
          <div className="p-4">
            <InlineAlert title="Unable to load coupons">
              {errorMessage(error)} <button type="button" className="font-semibold underline" onClick={refetch}>Retry</button>
            </InlineAlert>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={`${ADMIN_TABLE.table} min-w-[960px]`}>
            <thead>
              <tr className={ADMIN_TABLE.headRow}>
                <th className={ADMIN_TABLE.th}>Code</th>
                <th className={ADMIN_TABLE.th}>Discount</th>
                <th className={ADMIN_TABLE.th}>Applies to</th>
                <th className={ADMIN_TABLE.th}>Usage</th>
                <th className={ADMIN_TABLE.th}>Valid</th>
                <th className={ADMIN_TABLE.th}>State</th>
                <th className={`${ADMIN_TABLE.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${ADMIN_TABLE.body} ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
              {isLoading ? (
                <tr><td colSpan={7}><TableSkeleton rows={6} cols={6} /></td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<Ticket size={20} />}
                      title={debounced ? 'No matching coupons' : 'No coupons yet'}
                      description={debounced ? `No code starts with “${debounced.toUpperCase()}”.` : 'Create your first discount code to run a promotion.'}
                      actionLabel={debounced ? undefined : 'New coupon'}
                      onAction={debounced ? undefined : () => router.push(NEW_PATH)}
                    />
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className={ADMIN_TABLE.row}>
                    <td className={ADMIN_TABLE.td}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold tracking-wide text-slate-900 dark:text-white">{c.code}</span>
                        <IconAction label={`Copy ${c.code}`} onClick={() => copy(c.code)}><Copy size={13} /></IconAction>
                      </div>
                      {c.description && <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500 dark:text-slate-400" title={c.description}>{c.description}</p>}
                    </td>
                    <td className={ADMIN_TABLE.td}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{discountLabel(c)}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {c.minimumOrderAmount > 0 ? `Min. order ${formatMoney(c.minimumOrderAmount)}` : 'No minimum'}
                        {c.firstOrderOnly && ' · First order'}
                      </p>
                    </td>
                    <td className={`${ADMIN_TABLE.td} text-xs`}>
                      {c.productIds?.length ? <Badge tone="info">{c.productIds.length} series</Badge> : <span className="text-slate-500 dark:text-slate-400">All paid series</span>}
                    </td>
                    <td className={ADMIN_TABLE.td}>
                      <UsageMeter used={c.usedCount} limit={c.usageLimit} />
                      <p className="mt-1 text-[11px] text-slate-400">{c.perUserUsageLimit ? `${c.perUserUsageLimit} per user` : 'No per-user cap'}</p>
                    </td>
                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs`}>
                      <p>{formatDate(c.startsAt, false)}</p>
                      <p className="text-slate-400">to {formatDate(c.expiresAt, false)}</p>
                    </td>
                    <td className={ADMIN_TABLE.td}><StatusBadge status={couponState(c)} styles={STATE_STYLES} /></td>
                    <td className={ADMIN_TABLE.td}>
                      <div className="flex items-center justify-end gap-1">
                        <EnableSwitch coupon={c} />
                        <IconAction label={`View redemptions of ${c.code}`} onClick={() => setViewing(c)}><Eye size={15} /></IconAction>
                        <IconAction label={`Edit ${c.code}`} onClick={() => router.push(`/admin-dashboard/coupons/${c.id}/edit`)}><Pencil size={15} /></IconAction>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(currentData?.totalPages || 0) > 1 && (
          <Pagination
            meta={zeroBasedMeta({ page, totalPages: currentData.totalPages, totalElements: currentData.totalElements, pageSize: PAGE_SIZE })}
            onPageChange={(next) => setPage(Math.max(0, next - 1))}
            disabled={isFetching}
          />
        )}
      </Card>

      {viewing && <RedemptionsDrawer coupon={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
