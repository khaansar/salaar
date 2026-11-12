'use client';

import { useMemo, useState } from 'react';
import {
  CalendarRange,
  Copy,
  Eye,
  Pencil,
  Percent,
  Plus,
  Search,
  Shuffle,
  Target,
  Ticket,
  Users,
  X,
} from 'lucide-react';

import {
  useCreateAdminCouponMutation,
  useGetAdminCouponRedemptionsQuery,
  useGetAdminCouponsQuery,
  useGetAdminProductsQuery,
  useSetAdminCouponEnabledMutation,
  useUpdateAdminCouponMutation,
} from '@/store/adminApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination, zeroBasedMeta } from '@/components/ui/Pagination';
import { ADMIN_TABLE, IconAction, InlineAlert, SegmentedTabs, StatusBadge } from '@/components/admin/AdminUi';
import { errorMessage, formatDate, formatMoney, shortId } from '@/components/admin/paymentFormat';

const PAGE_SIZE = 20;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I lookalikes
const DAY_MS = 24 * 60 * 60 * 1000;
const VALIDITY_PRESETS = [
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
];

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

function randomCode(length = 8) {
  const bytes = new Uint32Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

/** Date → value for <input type="datetime-local"> in the admin's timezone. */
function toLocalInput(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const rupeesToMinor = (v) => Math.round(Number(v) * 100);
const minorToRupees = (v) => (v == null ? '' : String(v / 100));
const isBlank = (v) => v === '' || v == null;

function emptyForm() {
  const start = new Date();
  start.setSeconds(0, 0);
  return {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscount: '',
    minOrder: '',
    startsAt: toLocalInput(start),
    expiresAt: toLocalInput(start.getTime() + 30 * DAY_MS),
    usageLimit: '',
    perUserLimit: '1',
    firstOrderOnly: false,
    stackable: false,
    scope: 'ALL',
    products: {},
  };
}

function formFromCoupon(c) {
  return {
    code: c.code,
    description: c.description || '',
    discountType: c.discountType,
    discountValue: c.discountType === 'PERCENTAGE' ? String(c.discountValue / 100) : minorToRupees(c.discountValue),
    maxDiscount: minorToRupees(c.maximumDiscountAmount),
    minOrder: c.minimumOrderAmount ? minorToRupees(c.minimumOrderAmount) : '',
    startsAt: toLocalInput(c.startsAt),
    expiresAt: toLocalInput(c.expiresAt),
    usageLimit: c.usageLimit == null ? '' : String(c.usageLimit),
    perUserLimit: c.perUserUsageLimit == null ? '' : String(c.perUserUsageLimit),
    firstOrderOnly: c.firstOrderOnly,
    stackable: c.stackable,
    scope: c.productIds?.length ? 'SPECIFIC' : 'ALL',
    // Names are filled in by the picker once the catalog lookup returns.
    products: Object.fromEntries((c.productIds || []).map((id) => [id, { id }])),
  };
}

/** Mirrors the backend rules so admins get feedback before submitting. */
function validate(f, coupon) {
  const e = {};
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(f.code.trim())) e.code = 'Use 3–64 letters, numbers, dashes or underscores.';
  const value = Number(f.discountValue);
  if (isBlank(f.discountValue) || !(value > 0)) e.discountValue = 'Enter a discount greater than zero.';
  else if (f.discountType === 'PERCENTAGE' && value > 100) e.discountValue = 'A percentage cannot exceed 100.';
  if (!isBlank(f.maxDiscount) && !(Number(f.maxDiscount) > 0)) e.maxDiscount = 'Leave empty or enter an amount above zero.';
  if (!isBlank(f.minOrder) && !(Number(f.minOrder) >= 0)) e.minOrder = 'Minimum order cannot be negative.';
  const start = new Date(f.startsAt).getTime();
  const end = new Date(f.expiresAt).getTime();
  if (Number.isNaN(start)) e.startsAt = 'Choose a start date.';
  if (Number.isNaN(end)) e.expiresAt = 'Choose an end date.';
  else if (!Number.isNaN(start) && end <= start) e.expiresAt = 'End must be after the start.';
  for (const [key, label] of [['usageLimit', 'Total uses'], ['perUserLimit', 'Uses per user']]) {
    if (!isBlank(f[key]) && !(Number.isInteger(Number(f[key])) && Number(f[key]) > 0)) e[key] = `${label} must be a whole number above zero.`;
  }
  if (!e.usageLimit && coupon && !isBlank(f.usageLimit) && Number(f.usageLimit) < coupon.usedCount) {
    e.usageLimit = `Already used ${coupon.usedCount} times; the limit cannot be lower.`;
  }
  if (f.scope === 'SPECIFIC' && Object.keys(f.products).length === 0) e.products = 'Pick at least one series, or apply to all.';
  return e;
}

function toRequest(f) {
  return {
    code: f.code.trim().toUpperCase(),
    description: f.description.trim() || null,
    discountType: f.discountType,
    discountValue: f.discountType === 'PERCENTAGE' ? Math.round(Number(f.discountValue) * 100) : rupeesToMinor(f.discountValue),
    minimumOrderAmount: isBlank(f.minOrder) ? 0 : rupeesToMinor(f.minOrder),
    maximumDiscountAmount: f.discountType === 'PERCENTAGE' && !isBlank(f.maxDiscount) ? rupeesToMinor(f.maxDiscount) : null,
    startsAt: new Date(f.startsAt).toISOString(),
    expiresAt: new Date(f.expiresAt).toISOString(),
    usageLimit: isBlank(f.usageLimit) ? null : Number(f.usageLimit),
    perUserUsageLimit: isBlank(f.perUserLimit) ? null : Number(f.perUserLimit),
    stackable: f.stackable,
    firstOrderOnly: f.firstOrderOnly,
    productIds: f.scope === 'SPECIFIC' ? Object.keys(f.products) : [],
  };
}

/* --------------------------------------------------------------- components */

function FieldLabel({ children, hint }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{children}</span>
      {hint && <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Icon size={14} /> {title}
      </h3>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </label>
  );
}

function CouponPreview({ form }) {
  const value = Number(form.discountValue);
  const hasValue = value > 0;
  const lines = [];
  if (!isBlank(form.minOrder) && Number(form.minOrder) > 0) lines.push(`On orders of ${formatMoney(rupeesToMinor(form.minOrder))} or more`);
  lines.push(form.scope === 'SPECIFIC' ? `Valid on ${Object.keys(form.products).length || 'selected'} series` : 'Valid on every paid series');
  if (form.firstOrderOnly) lines.push("Only for a customer's first paid order");
  const limits = [
    isBlank(form.usageLimit) ? 'Unlimited uses' : `${form.usageLimit} uses total`,
    isBlank(form.perUserLimit) ? 'no per-user cap' : `${form.perUserLimit} per user`,
  ];
  lines.push(limits.join(' · '));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-md">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-100">Preview</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {hasValue
              ? form.discountType === 'PERCENTAGE'
                ? `${value}% off`
                : `${formatMoney(rupeesToMinor(value))} off`
              : 'Set a discount'}
          </p>
          {form.discountType === 'PERCENTAGE' && !isBlank(form.maxDiscount) && Number(form.maxDiscount) > 0 && (
            <p className="text-sm text-indigo-100">Up to {formatMoney(rupeesToMinor(form.maxDiscount))}</p>
          )}
        </div>
        <span className="shrink-0 rounded-lg border border-dashed border-white/60 bg-white/10 px-3 py-1.5 font-mono text-sm font-bold tracking-wider">
          {form.code.trim().toUpperCase() || 'CODE'}
        </span>
      </div>
      <ul className="mt-4 space-y-1 text-xs text-indigo-50">
        {lines.map((l) => <li key={l}>• {l}</li>)}
        <li>• {formatDate(form.startsAt)} → {formatDate(form.expiresAt)}</li>
      </ul>
    </div>
  );
}

function SeriesPicker({ selected, onChange, error }) {
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term);
  const { currentData, isFetching } = useGetAdminProductsQuery({ type: 'TEST_SERIES', paidOnly: true, q: debounced.trim() || undefined, size: 30 });

  // Resolve names for ids carried over from an existing coupon.
  const unnamed = Object.values(selected).filter((p) => !p.name).map((p) => p.id).sort();
  const { currentData: named } = useGetAdminProductsQuery({ ids: unnamed, size: 100 }, { skip: unnamed.length === 0 });
  const nameById = useMemo(() => new Map((named?.content || []).map((p) => [p.id, p])), [named]);

  const toggle = (p) => {
    const next = { ...selected };
    if (next[p.id]) delete next[p.id];
    else next[p.id] = p;
    onChange(next);
  };
  const products = currentData?.content || [];

  return (
    <div>
      {Object.keys(selected).length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {Object.values(selected).map((p) => {
            const name = p.name || nameById.get(p.id)?.name || shortId(p.id);
            return (
              <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {name}
                <button type="button" aria-label={`Remove ${name}`} onClick={() => toggle(p)} className="rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <Input aria-label="Search series" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search paid series" leftIcon={<Search size={16} />} />
      <div className={`mt-2 max-h-52 overflow-y-auto rounded-xl border ${error ? 'border-rose-300 dark:border-rose-500/40' : 'border-slate-200 dark:border-slate-800'}`}>
        {isFetching && products.length === 0 ? (
          <div className="space-y-2 p-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
        ) : products.length === 0 ? (
          <p className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">No paid series found.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <input type="checkbox" checked={Boolean(selected[p.id])} onChange={() => toggle(p)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{formatMoney(p.currentPriceMinor, p.currency)}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

function CouponFormDrawer({ coupon, onClose }) {
  const toast = useToast();
  const editing = Boolean(coupon);
  const [form, setForm] = useState(() => (coupon ? formFromCoupon(coupon) : emptyForm()));
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createCoupon, createState] = useCreateAdminCouponMutation();
  const [updateCoupon, updateState] = useUpdateAdminCouponMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const errors = validate(form, coupon);
  const shown = submitted ? errors : {};
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const onInput = (key) => (e) => set(key)(e.target.value);

  const applyPreset = (days) => {
    const start = new Date(form.startsAt);
    const base = Number.isNaN(start.getTime()) ? new Date() : start;
    set('expiresAt')(toLocalInput(base.getTime() + days * DAY_MS));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError('');
    if (Object.keys(errors).length > 0) return;
    try {
      const body = toRequest(form);
      if (editing) await updateCoupon({ id: coupon.id, ...body }).unwrap();
      else await createCoupon(body).unwrap();
      toast.success(editing ? `Coupon ${body.code} updated.` : `Coupon ${body.code} created.`);
      onClose();
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <Drawer
      open
      onClose={saving ? () => {} : onClose}
      width="2xl"
      title={editing ? `Edit ${coupon.code}` : 'New coupon'}
      description={editing ? 'Changes apply to future checkouts only; past orders keep their discount.' : 'Create a discount code customers can enter at checkout.'}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {submitted && Object.keys(errors).length > 0 ? `Fix ${Object.keys(errors).length} field(s) to continue.` : ''}
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" form="coupon-form" isLoading={saving}>{editing ? 'Save changes' : 'Create coupon'}</Button>
          </div>
        </div>
      }
    >
      <form id="coupon-form" onSubmit={submit} noValidate className="space-y-7">
        <CouponPreview form={form} />

        <Section icon={Ticket} title="Code">
          <div>
            <FieldLabel hint={editing ? 'Codes cannot be changed' : 'Customers type this at checkout'}>Coupon code</FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  aria-label="Coupon code"
                  value={form.code}
                  onChange={(e) => set('code')(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="e.g. WELCOME20"
                  maxLength={64}
                  disabled={editing}
                  className="font-mono uppercase tracking-wider"
                  error={shown.code}
                />
              </div>
              {!editing && (
                <Button type="button" variant="outline" onClick={() => set('code')(randomCode())} title="Generate a random code">
                  <Shuffle size={15} className="mr-1.5" /> Generate
                </Button>
              )}
            </div>
          </div>
          <Input id="coupon-description" label="Internal note (optional)" value={form.description} onChange={onInput('description')} maxLength={255} placeholder="e.g. Diwali campaign for new signups" />
        </Section>

        <Section icon={Percent} title="Discount">
          <SegmentedTabs
            tabs={[{ value: 'PERCENTAGE', label: 'Percentage' }, { value: 'FIXED_AMOUNT', label: 'Fixed amount' }]}
            value={form.discountType}
            onChange={set('discountType')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="coupon-value"
              type="number"
              inputMode="decimal"
              min="0"
              step={form.discountType === 'PERCENTAGE' ? '0.01' : '1'}
              label={form.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (₹)'}
              value={form.discountValue}
              onChange={onInput('discountValue')}
              placeholder={form.discountType === 'PERCENTAGE' ? '20' : '100'}
              error={shown.discountValue}
            />
            {form.discountType === 'PERCENTAGE' && (
              <Input id="coupon-max" type="number" min="0" label="Maximum discount (₹)" value={form.maxDiscount} onChange={onInput('maxDiscount')} placeholder="No cap" helpText="Caps the saving on expensive orders." error={shown.maxDiscount} />
            )}
            <Input id="coupon-min" type="number" min="0" label="Minimum order (₹)" value={form.minOrder} onChange={onInput('minOrder')} placeholder="No minimum" error={shown.minOrder} />
          </div>
        </Section>

        <Section icon={CalendarRange} title="Validity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="coupon-start" type="datetime-local" label="Starts" value={form.startsAt} onChange={onInput('startsAt')} error={shown.startsAt} />
            <Input id="coupon-end" type="datetime-local" label="Ends" value={form.expiresAt} onChange={onInput('expiresAt')} error={shown.expiresAt} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Run for</span>
            {VALIDITY_PRESETS.map((p) => (
              <button key={p.days} type="button" onClick={() => applyPreset(p.days)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300">
                {p.label}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Users} title="Usage limits">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="coupon-usage" type="number" min="1" step="1" label="Total uses" value={form.usageLimit} onChange={onInput('usageLimit')} placeholder="Unlimited" helpText={editing ? `Used ${coupon.usedCount} times so far.` : 'Across all customers.'} error={shown.usageLimit} />
            <Input id="coupon-per-user" type="number" min="1" step="1" label="Uses per customer" value={form.perUserLimit} onChange={onInput('perUserLimit')} placeholder="Unlimited" error={shown.perUserLimit} />
          </div>
          <Toggle checked={form.firstOrderOnly} onChange={set('firstOrderOnly')} label="First order only" description="Only customers who have never completed a paid order can use it." />
        </Section>

        <Section icon={Target} title="Applies to">
          <SegmentedTabs
            tabs={[{ value: 'ALL', label: 'All paid series' }, { value: 'SPECIFIC', label: 'Specific series' }]}
            value={form.scope}
            onChange={set('scope')}
          />
          {form.scope === 'SPECIFIC' && <SeriesPicker selected={form.products} onChange={set('products')} error={shown.products} />}
        </Section>

        {serverError && <InlineAlert title={editing ? 'Coupon not saved' : 'Coupon not created'}>{serverError}</InlineAlert>}
      </form>
    </Drawer>
  );
}

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
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // null | 'new' | coupon
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
        actions={<Button onClick={() => setEditing('new')}><Plus size={16} className="mr-1.5" /> New coupon</Button>}
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
                      onAction={debounced ? undefined : () => setEditing('new')}
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
                        <IconAction label={`Edit ${c.code}`} onClick={() => setEditing(c)}><Pencil size={15} /></IconAction>
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

      {editing && <CouponFormDrawer key={editing === 'new' ? 'new' : editing.id} coupon={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {viewing && <RedemptionsDrawer coupon={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
