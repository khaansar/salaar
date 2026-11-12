'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  Check,
  KeyRound,
  Mail,
  Library,
  Plus,
  Search,
  ShieldOff,
  UserRound,
  X,
} from 'lucide-react';

import {
  useGetAdminEntitlementsQuery,
  useGetAdminProductsQuery,
  useGrantAdminEntitlementMutation,
  useRevokeAdminEntitlementMutation,
} from '@/store/adminApi';
import { usersApi } from '@/services/userService';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ADMIN_TABLE, InlineAlert, SegmentedTabs, StatusBadge } from '@/components/admin/AdminUi';
import { errorMessage, formatDate, formatMoney, fullName, shortId } from '@/components/admin/paymentFormat';

const USER_RESULTS = 8;
// Backend page size cap; a single user's entitlements comfortably fit.
const ENTITLEMENT_PAGE = 100;

const SOURCE_LABELS = {
  PURCHASE: 'Purchased',
  ADMIN_GRANT: 'Admin grant',
  PROMOTION: 'Promotion',
  COMPENSATION: 'Compensation',
};

const SOURCE_TONES = {
  PURCHASE: 'success',
  ADMIN_GRANT: 'info',
  PROMOTION: 'warning',
  COMPENSATION: 'neutral',
};

const GRANT_SOURCES = ['ADMIN_GRANT', 'PROMOTION', 'COMPENSATION'];

const STATUS_STYLES = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  LAPSED: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  REVOKED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
  EXPIRED: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STATUS_TABS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REVOKED', label: 'Revoked' },
  { value: '', label: 'All history' },
];

/** ACTIVE rows whose expiry has passed no longer grant access, even before a job marks them EXPIRED. */
function effectiveStatus(entitlement) {
  if (entitlement.status === 'ACTIVE' && entitlement.expiresAt && new Date(entitlement.expiresAt) <= new Date()) {
    return 'LAPSED';
  }
  return entitlement.status;
}

/** Splits "Jane Doe" into first/last name filters the same way the Users page does. */
function userSearchParams(term) {
  const words = term.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return { firstName: words[0], lastName: words.slice(1).join(' ') };
  return { search: words[0] || undefined };
}

function useUserSearch(term) {
  const debounced = useDebounce(term);
  const [state, setState] = useState({ users: [], loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    usersApi
      .list({ page: 0, size: USER_RESULTS, ...userSearchParams(debounced) })
      .then((res) => !cancelled && setState({ users: res.content, loading: false, error: '' }))
      .catch((err) => !cancelled && setState({ users: [], loading: false, error: err?.message || 'Unable to load users.' }));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return state;
}

function UserPicker({ selectedId, onSelect }) {
  const [term, setTerm] = useState('');
  const { users, loading, error } = useUserSearch(term);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Find a user</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Search by name or email</p>
        <div className="mt-3">
          <Input
            aria-label="Search users"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. priya@example.com"
            leftIcon={<Search size={16} />}
          />
        </div>
      </div>

      <div className="max-h-[560px] flex-1 overflow-y-auto p-2">
        {error && <InlineAlert className="m-2">{error}</InlineAlert>}
        {loading && users.length === 0 ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : !error && users.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">No users match “{term}”.</p>
        ) : (
          <ul className={`space-y-1 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {users.map((user) => {
              const active = user.id === selectedId;
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(user)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      active
                        ? 'bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Avatar name={fullName(user)} avatarUrl={user.avatarUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{fullName(user)}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                    </span>
                    {active && <Check size={16} className="shrink-0 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

function GrantAccessModal({ user, activeByReference, onClose }) {
  const toast = useToast();
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term);
  const [selected, setSelected] = useState({}); // referenceId -> product
  const [source, setSource] = useState('ADMIN_GRANT');
  const [expiry, setExpiry] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [grantEntitlement] = useGrantAdminEntitlementMutation();

  const { currentData, isFetching, isError } = useGetAdminProductsQuery({
    type: 'TEST_SERIES',
    paidOnly: true,
    q: debounced.trim() || undefined,
    size: 50,
  });
  const products = currentData?.content || [];
  const selectedList = Object.values(selected);
  const today = new Date().toISOString().slice(0, 10);

  const toggle = (product) =>
    setSelected((cur) => {
      const next = { ...cur };
      if (next[product.referenceId]) delete next[product.referenceId];
      else next[product.referenceId] = product;
      return next;
    });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (selectedList.length === 0) return setError('Select at least one test series.');
    if (reason.trim().length < 3) return setError('Add a short reason (at least 3 characters) for the audit log.');
    // End of the chosen day in the admin's timezone.
    const expiresAt = expiry ? new Date(`${expiry}T23:59:59`).toISOString() : undefined;

    setSubmitting(true);
    const results = await Promise.allSettled(
      selectedList.map((p) =>
        grantEntitlement({
          userId: user.id,
          productType: 'TEST_SERIES',
          productReferenceId: p.referenceId,
          source,
          reason: reason.trim(),
          expiresAt,
        }).unwrap()
      )
    );
    setSubmitting(false);

    const failed = selectedList.filter((_, i) => results[i].status === 'rejected');
    const granted = selectedList.length - failed.length;
    if (granted > 0) toast.success(`Access granted to ${granted} series for ${fullName(user)}.`);
    if (failed.length === 0) return onClose();

    // Keep only the failures selected so the admin can retry them.
    setSelected(Object.fromEntries(failed.map((p) => [p.referenceId, p])));
    const firstError = results.find((r) => r.status === 'rejected')?.reason;
    setError(`${failed.length} grant(s) failed: ${errorMessage(firstError)}`);
  };

  return (
    <Modal
      open
      onClose={submitting ? () => {} : onClose}
      width="2xl"
      title="Grant series access"
      description={`${fullName(user)} · ${user.email}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="grant-form" isLoading={submitting} disabled={selectedList.length === 0}>
            {selectedList.length > 1 ? `Grant access to ${selectedList.length} series` : 'Grant access'}
          </Button>
        </>
      }
    >
      <form id="grant-form" onSubmit={submit} className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Paid test series</p>
            {selectedList.length > 0 && (
              <button type="button" onClick={() => setSelected({})} className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400">
                Clear selection ({selectedList.length})
              </button>
            )}
          </div>
          <Input aria-label="Search series" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search series by name" leftIcon={<Search size={16} />} />

          {selectedList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedList.map((p) => (
                <span key={p.referenceId} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {p.name}
                  <button type="button" aria-label={`Remove ${p.name}`} onClick={() => toggle(p)} className="rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
            {isError ? (
              <InlineAlert className="m-3">Unable to load the product catalog from the payment service.</InlineAlert>
            ) : isFetching && products.length === 0 ? (
              <div className="space-y-2 p-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : products.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                {debounced ? `No paid series match “${debounced}”.` : 'No paid test series are available yet.'}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => {
                  const existing = activeByReference.get(p.referenceId);
                  const lapsed = existing && effectiveStatus(existing) === 'LAPSED';
                  const checked = Boolean(selected[p.referenceId]);
                  return (
                    <li key={p.id}>
                      <label className={`flex items-center gap-3 px-3 py-2.5 ${existing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                          checked={checked || Boolean(existing && !lapsed)}
                          disabled={Boolean(existing)}
                          onChange={() => toggle(p)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                          {p.status !== 'ACTIVE' && <span className="text-[11px] text-amber-600 dark:text-amber-400">Not currently on sale</span>}
                        </span>
                        {existing ? (
                          <Badge tone={lapsed ? 'warning' : 'success'}>{lapsed ? 'Lapsed — revoke to re-grant' : 'Has access'}</Badge>
                        ) : (
                          <span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">{formatMoney(p.currentPriceMinor, p.currency)}</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select id="grant-source" label="Grant type" value={source} onChange={(e) => setSource(e.target.value)}>
            {GRANT_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
          </Select>
          <Input
            id="grant-expiry"
            type="date"
            label="Access until (optional)"
            min={today}
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            helpText={expiry ? `Access ends at 23:59 on ${formatDate(`${expiry}T23:59:59`, false)}.` : 'Leave empty for lifetime access.'}
          />
        </div>

        <div>
          <Textarea id="grant-reason" label="Reason" rows={2} maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Congratulations on winning our monthly scholarship!" />
          <div className="mt-1 flex items-start justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-start gap-1">
              <Mail size={12} className="mt-px shrink-0" />
              The user gets an email and in-app notice, and this reason is shown to them. Write it for the student.
            </span>
            <span className="shrink-0">{reason.length}/255</span>
          </div>
        </div>

        {error && <InlineAlert title="Access not fully granted">{error}</InlineAlert>}
      </form>
    </Modal>
  );
}

function RevokeAccessModal({ entitlement, seriesName, onClose }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [revoke, { isLoading }] = useRevokeAdminEntitlementMutation();
  const purchased = entitlement.source === 'PURCHASE';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (reason.trim().length < 3) return setError('Add a short reason (at least 3 characters) for the audit log.');
    try {
      await revoke({ id: entitlement.id, reason: reason.trim() }).unwrap();
      toast.success(`Access to ${seriesName} revoked.`);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Modal
      open
      onClose={isLoading ? () => {} : onClose}
      width="lg"
      title="Revoke access"
      description={seriesName}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="revoke-form" variant="danger" isLoading={isLoading}>Revoke access</Button>
        </>
      }
    >
      <form id="revoke-form" onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The user immediately loses access to every test in this series. Existing attempts and results are kept.
        </p>
        {purchased && (
          <InlineAlert tone="warning" title="This access was purchased">
            Revoking does not refund the user. Issue a refund from the Payments page if one is owed.
          </InlineAlert>
        )}
        <Textarea id="revoke-reason" label="Reason" rows={2} maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Granted by mistake, promotion ended…" autoFocus />
        {error && <InlineAlert title="Access not revoked">{error}</InlineAlert>}
      </form>
    </Modal>
  );
}

function UserAccessPanel({ user }) {
  const [status, setStatus] = useState('ACTIVE');
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState(null);

  // Always load active grants: they drive the grant picker's "Has access" state.
  const activeQuery = useGetAdminEntitlementsQuery({ userId: user.id, status: 'ACTIVE', size: ENTITLEMENT_PAGE });
  const listQuery = useGetAdminEntitlementsQuery(
    { userId: user.id, status: status || undefined, size: ENTITLEMENT_PAGE },
    { skip: status === 'ACTIVE' }
  );
  const query = status === 'ACTIVE' ? activeQuery : listQuery;

  const entitlements = useMemo(
    () => (query.currentData?.content || []).filter((e) => e.productType === 'TEST_SERIES'),
    [query.currentData]
  );
  const activeByReference = useMemo(
    () => new Map((activeQuery.currentData?.content || []).filter((e) => e.productType === 'TEST_SERIES').map((e) => [e.productReferenceId, e])),
    [activeQuery.currentData]
  );

  const referenceIds = useMemo(() => [...new Set(entitlements.map((e) => e.productReferenceId))].sort(), [entitlements]);
  const { currentData: productPage } = useGetAdminProductsQuery(
    { type: 'TEST_SERIES', referenceIds, size: ENTITLEMENT_PAGE },
    { skip: referenceIds.length === 0 }
  );
  const nameByReference = useMemo(
    () => new Map((productPage?.content || []).map((p) => [p.referenceId, p.name])),
    [productPage]
  );
  const seriesName = (e) => nameByReference.get(e.productReferenceId) || `Series ${shortId(e.productReferenceId)}`;

  const tabs = STATUS_TABS.map((t) => (t.value === 'ACTIVE' ? { ...t, count: activeByReference.size } : t));

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={fullName(user)} avatarUrl={user.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-white">{fullName(user)}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        <Button onClick={() => setGranting(true)} disabled={activeQuery.isLoading}>
          <Plus size={16} className="mr-1.5" /> Grant access
        </Button>
      </div>

      <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <SegmentedTabs tabs={tabs} value={status} onChange={setStatus} />
      </div>

      {query.isError && <InlineAlert className="m-4" title="Unable to load access">{errorMessage(query.error)}</InlineAlert>}

      <div className="overflow-x-auto">
        <table className={`${ADMIN_TABLE.table} min-w-[720px]`}>
          <thead>
            <tr className={ADMIN_TABLE.headRow}>
              <th className={ADMIN_TABLE.th}>Test series</th>
              <th className={ADMIN_TABLE.th}>How</th>
              <th className={ADMIN_TABLE.th}>Granted</th>
              <th className={ADMIN_TABLE.th}>Access until</th>
              <th className={ADMIN_TABLE.th}>Status</th>
              <th className={`${ADMIN_TABLE.th} text-right`}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE.body}>
            {query.isLoading ? (
              <tr><td colSpan={6}><TableSkeleton rows={4} cols={5} /></td></tr>
            ) : entitlements.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={<Library size={20} />}
                    title={status === 'ACTIVE' ? 'No paid series unlocked' : 'Nothing here'}
                    description={status === 'ACTIVE' ? 'This user has not purchased or been granted any test series.' : 'No matching access records for this user.'}
                    actionLabel={status === 'ACTIVE' ? 'Grant access' : undefined}
                    onAction={status === 'ACTIVE' ? () => setGranting(true) : undefined}
                  />
                </td>
              </tr>
            ) : (
              entitlements.map((e) => {
                const eff = effectiveStatus(e);
                return (
                  <tr key={e.id} className={ADMIN_TABLE.row}>
                    <td className={ADMIN_TABLE.td}>
                      <p className="font-medium text-slate-900 dark:text-white">{seriesName(e)}</p>
                      {e.sourceOrderId && <p className="mt-0.5 font-mono text-[11px] text-slate-400">Order {shortId(e.sourceOrderId)}</p>}
                    </td>
                    <td className={ADMIN_TABLE.td}><Badge tone={SOURCE_TONES[e.source] || 'neutral'}>{SOURCE_LABELS[e.source] || e.source}</Badge></td>
                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs`}>{formatDate(e.grantedAt)}</td>
                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs`}>
                      {e.revokedAt ? <span className="text-rose-600 dark:text-rose-400">Revoked {formatDate(e.revokedAt, false)}</span> : e.expiresAt ? formatDate(e.expiresAt, false) : 'Lifetime'}
                    </td>
                    <td className={ADMIN_TABLE.td}><StatusBadge status={eff} styles={STATUS_STYLES} /></td>
                    <td className={`${ADMIN_TABLE.td} text-right`}>
                      {e.status === 'ACTIVE' && (
                        <Button variant="dangerOutline" size="sm" onClick={() => setRevoking(e)}>
                          <ShieldOff size={14} className="mr-1.5" /> Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {granting && <GrantAccessModal user={user} activeByReference={activeByReference} onClose={() => setGranting(false)} />}
      {revoking && <RevokeAccessModal entitlement={revoking} seriesName={seriesName(revoking)} onClose={() => setRevoking(null)} />}
    </Card>
  );
}

export default function SeriesAccessPage() {
  const [user, setUser] = useState(null);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Series Access' }]}
        title="Series Access"
        subtitle="Unlock paid test series for a user without a purchase, or take access away."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <UserPicker selectedId={user?.id} onSelect={setUser} />
        {user ? (
          <UserAccessPanel key={user.id} user={user} />
        ) : (
          <Card className="flex min-h-[320px] items-center justify-center p-6">
            <EmptyState icon={<UserRound size={20} />} title="Select a user" description="Pick a user on the left to see which paid series they can access and manage it." />
          </Card>
        )}
      </div>

      <div className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
        <KeyRound size={14} className="mt-0.5 shrink-0" />
        <p>
          Grants and revocations are applied by the payment service and recorded in its audit log. Granting access never creates an order or charges the user.
          <CalendarClock size={12} className="mx-1 inline" />
          Grants with an end date stop working automatically after that day.
        </p>
      </div>
    </div>
  );
}
