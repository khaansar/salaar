'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarRange, Percent, Save, Search, Shuffle, Target, Ticket, Users, X } from 'lucide-react';

import { useCreateAdminCouponMutation, useGetAdminProductsQuery, useUpdateAdminCouponMutation } from '@/store/adminApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { FormActionBar, FormSection, InlineAlert, SegmentedTabs } from '@/components/admin/AdminUi';
import { errorMessage, formatDate, formatMoney, shortId } from '@/components/admin/paymentFormat';

const LIST_PATH = '/admin-dashboard/coupons';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I lookalikes
const DAY_MS = 24 * 60 * 60 * 1000;
const VALIDITY_PRESETS = [
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
];

/* ------------------------------------------------------------------ helpers */

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
    // Not used by checkout pricing today; preserved so edits do not change it.
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
  for (const [key, label] of [['usageLimit', 'Total uses'], ['perUserLimit', 'Uses per customer']]) {
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

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
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

/** Ticket-style summary of what the customer will get. */
function CouponPreview({ form }) {
  const value = Number(form.discountValue);
  const headline = value > 0
    ? form.discountType === 'PERCENTAGE' ? `${value}% off` : `${formatMoney(rupeesToMinor(value))} off`
    : 'Set a discount';
  const cap = form.discountType === 'PERCENTAGE' && Number(form.maxDiscount) > 0 ? `Up to ${formatMoney(rupeesToMinor(form.maxDiscount))}` : null;

  const rows = [
    ['Minimum order', Number(form.minOrder) > 0 ? formatMoney(rupeesToMinor(form.minOrder)) : 'None'],
    ['Applies to', form.scope === 'SPECIFIC' ? `${Object.keys(form.products).length} series` : 'All paid series'],
    ['Total uses', isBlank(form.usageLimit) ? 'Unlimited' : form.usageLimit],
    ['Per customer', isBlank(form.perUserLimit) ? 'Unlimited' : form.perUserLimit],
    ['Customers', form.firstOrderOnly ? 'First order only' : 'Everyone'],
    ['Starts', formatDate(form.startsAt)],
    ['Ends', formatDate(form.expiresAt)],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-6 text-center text-white">
        <p className="text-3xl font-bold tracking-tight">{headline}</p>
        {cap && <p className="mt-1 text-sm text-indigo-100">{cap}</p>}
        <span className="mt-4 inline-block rounded-lg border border-dashed border-white/60 bg-white/10 px-4 py-1.5 font-mono text-sm font-bold tracking-widest">
          {form.code.trim().toUpperCase() || 'YOURCODE'}
        </span>
      </div>
      {/* Perforated edge between the two halves of the ticket. */}
      <div className="relative h-0 border-t border-dashed border-slate-200 dark:border-slate-700">
        <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" />
        <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" />
      </div>
      <dl className="divide-y divide-slate-100 px-5 py-2 text-sm dark:divide-slate-800">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2">
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="text-right font-medium text-slate-800 dark:text-slate-200">{val}</dd>
          </div>
        ))}
      </dl>
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
        <div className="mb-3 flex flex-wrap gap-1.5">
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
      <div className={`mt-2 max-h-64 overflow-y-auto rounded-xl border ${error ? 'border-rose-300 dark:border-rose-500/40' : 'border-slate-200 dark:border-slate-800'}`}>
        {isFetching && products.length === 0 ? (
          <div className="space-y-2 p-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
        ) : products.length === 0 ? (
          <p className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">No paid series found.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
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

export function CouponForm({ coupon }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(coupon);
  const [form, setForm] = useState(() => (coupon ? formFromCoupon(coupon) : emptyForm()));
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createCoupon, createState] = useCreateAdminCouponMutation();
  const [updateCoupon, updateState] = useUpdateAdminCouponMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const errors = validate(form, coupon);
  const errorCount = Object.keys(errors).length;
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
    if (errorCount > 0) return;
    try {
      const body = toRequest(form);
      if (isEdit) await updateCoupon({ id: coupon.id, ...body }).unwrap();
      else await createCoupon(body).unwrap();
      toast.success(isEdit ? `Coupon ${body.code} updated.` : `Coupon ${body.code} created.`);
      router.push(LIST_PATH);
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection icon={Ticket} title="Coupon code" description={isEdit ? 'Codes cannot be changed once created.' : 'What customers type at checkout.'}>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  aria-label="Coupon code"
                  value={form.code}
                  onChange={(e) => set('code')(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="e.g. WELCOME20"
                  maxLength={64}
                  disabled={isEdit}
                  className="font-mono uppercase tracking-wider"
                  error={shown.code}
                />
              </div>
              {!isEdit && (
                <Button type="button" variant="outline" onClick={() => set('code')(randomCode())} title="Generate a random code">
                  <Shuffle size={15} className="mr-1.5" /> Generate
                </Button>
              )}
            </div>
            <Input id="coupon-description" label="Internal note (optional)" value={form.description} onChange={onInput('description')} maxLength={255} placeholder="e.g. Diwali campaign for new signups" helpText="Only admins see this." />
          </FormSection>

          <FormSection icon={Percent} tone="emerald" title="Discount" description="How much the customer saves.">
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
          </FormSection>

          <FormSection icon={CalendarRange} tone="sky" title="Validity" description="When customers can use the code.">
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
          </FormSection>

          <FormSection icon={Users} tone="amber" title="Usage limits" description="Keep the promotion under control.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="coupon-usage" type="number" min="1" step="1" label="Total uses" value={form.usageLimit} onChange={onInput('usageLimit')} placeholder="Unlimited" helpText={isEdit ? `Used ${coupon.usedCount} times so far.` : 'Across all customers.'} error={shown.usageLimit} />
              <Input id="coupon-per-user" type="number" min="1" step="1" label="Uses per customer" value={form.perUserLimit} onChange={onInput('perUserLimit')} placeholder="Unlimited" error={shown.perUserLimit} />
            </div>
            <Toggle checked={form.firstOrderOnly} onChange={set('firstOrderOnly')} label="First order only" description="Only customers who have never completed a paid order can use it." />
          </FormSection>

          <FormSection icon={Target} tone="violet" title="Applies to" description="Which series the discount works on.">
            <SegmentedTabs
              tabs={[{ value: 'ALL', label: 'All paid series' }, { value: 'SPECIFIC', label: 'Specific series' }]}
              value={form.scope}
              onChange={set('scope')}
            />
            {form.scope === 'SPECIFIC' && <SeriesPicker selected={form.products} onChange={set('products')} error={shown.products} />}
          </FormSection>

          {serverError && <InlineAlert title={isEdit ? 'Coupon not saved' : 'Coupon not created'}>{serverError}</InlineAlert>}
        </div>

        <div className="space-y-6 lg:sticky lg:top-4">
          <FormSection title="Preview" description="What the customer is offered.">
            <CouponPreview form={form} />
          </FormSection>
        </div>
      </div>

      <FormActionBar
        hint={submitted && errorCount > 0
          ? `Fix ${errorCount} highlighted field${errorCount > 1 ? 's' : ''} to continue.`
          : isEdit ? 'Changes apply to future checkouts only; past orders keep their discount.' : 'The code works at checkout as soon as its start time passes.'}
      >
        <Button type="button" variant="outline" onClick={() => router.push(LIST_PATH)} disabled={saving}>Cancel</Button>
        <Button type="submit" isLoading={saving}>
          <Save size={16} className="mr-2" />
          {isEdit ? 'Save changes' : 'Create coupon'}
        </Button>
      </FormActionBar>
    </form>
  );
}
