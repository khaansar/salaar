'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  Filter,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  X,
} from 'lucide-react';

import {
  useGetAdminPaymentsQuery,
  useGetAdminOrdersQuery,
  useGetAdminRefundsQuery,
  useGetAdminOrderDetailQuery,
  useGetAdminOrderTimelineQuery,
  useGetAdminRefundableAmountQuery,
  useRequestAdminRefundMutation,
} from '@/store/adminApi';

const PAGE_SIZE = 20;

const PAYMENT_STATUSES = [
  'CREATED',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

const ORDER_STATUSES = [
  'CREATED',
  'PAYMENT_PENDING',
  'PAID',
  'FULFILLED',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
  'PAYMENT_REVIEW',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

const REFUND_STATUSES = [
  'REQUESTED',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
];

const STATUS_STYLES = {
  CAPTURED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  FULFILLED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  SUCCEEDED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  CREATED: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PAYMENT_PENDING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  AUTHORIZED: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  REQUESTED: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  PROCESSING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  PAYMENT_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  FAILED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
  EXPIRED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
  REFUNDED: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
  PARTIALLY_REFUNDED: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
};

function formatMoney(amount, currency = 'INR') {
  if (amount == null || !Number.isFinite(Number(amount))) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) / 100);
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function shortId(value) {
  if (!value) {
    return '—';
  }

  return `${String(value).slice(0, 8)}…`;
}

function statusClass(status) {
  return STATUS_STYLES[status] || 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function StatusBadge({ status }) {
  if (!status) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(status)}`}>
      {String(status).replaceAll('_', ' ')}
    </span>
  );
}

function MetricCard({ label, value, description, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 break-words text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
          <p className="mt-1 text-[10px] leading-4 text-slate-400 dark:text-slate-500">{description}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Icon size={17} />
        </span>
      </div>
    </div>
  );
}

function ErrorNotice({ title, message }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
      <AlertCircle size={17} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
      <div>
        <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{title}</p>
        <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-400">{message}</p>
      </div>
    </div>
  );
}

function LoadingRows({ columns = 5 }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <div key={cellIndex} className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ))}
    </>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Search size={19} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

function Pagination({ pageData, page, setPage, isFetching }) {
  const totalPages = Math.max(pageData?.totalPages || 0, 1);
  const totalElements = pageData?.totalElements || 0;
  const pageSize = pageData?.size || PAGE_SIZE;
  const firstItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const lastItem = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {firstItem}–{lastItem} of {totalElements.toLocaleString()} records
      </p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-xs text-slate-500 dark:text-slate-400">Page {page + 1} of {totalPages}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 0 || isFetching} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40">
            <ChevronLeft size={14} /> Previous
          </button>
          <button type="button" disabled={page + 1 >= totalPages || isFetching} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`break-all text-xs font-medium text-slate-800 dark:text-slate-200 sm:max-w-[65%] sm:text-right ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

function OrderDetailsDrawer({ orderId, onClose }) {
  const { currentData: detail, isLoading, isError } = useGetAdminOrderDetailQuery(orderId, {
    skip: !orderId,
  });

  const { currentData: timeline, isLoading: timelineLoading } = useGetAdminOrderTimelineQuery(orderId, {
    skip: !orderId,
  });

  const order = detail?.order;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button type="button" aria-label="Close order details" onClick={onClose} className="absolute inset-0 bg-slate-950/40" />
      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Order details</p>
            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{order?.orderNumber || shortId(orderId)}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Order, payment attempts, refunds and timeline</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading && <p className="text-sm text-slate-500">Loading order details…</p>}
          {isError && <ErrorNotice title="Unable to load this order" message="Check the payment service and try again." />}

          {order && (
            <>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Order total</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(order.total, order.currency)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4">
                  <DetailRow label="Order ID" value={order.id} mono />
                  <DetailRow label="Order number" value={order.orderNumber} mono />
                  <DetailRow label="User ID" value={order.userId} mono />
                  <DetailRow label="Created" value={formatDate(order.createdAt)} />
                  <DetailRow label="Paid at" value={formatDate(order.paidAt)} />
                  <DetailRow label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
                  <DetailRow label="Discount" value={formatMoney(order.discount, order.currency)} />
                  <DetailRow label="Tax" value={formatMoney(order.tax, order.currency)} />
                  <DetailRow label="Coupon" value={order.couponCode || '—'} />
                  <DetailRow label="Refunded" value={formatMoney(order.refundedAmount, order.currency)} />
                </div>
              </div>

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Purchased items</h3>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  {(order.items || []).length === 0 ? (
                    <p className="p-4 text-xs text-slate-500">No item details were returned for this order.</p>
                  ) : (
                    order.items.map((item, index) => (
                      <div key={`${item.productId || 'item'}-${index}`} className="flex items-start justify-between gap-3 border-b border-slate-100 p-3 last:border-b-0 dark:border-slate-800">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name || item.productType || 'Product'}</p>
                          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{item.productType || '—'} · Qty {item.quantity ?? 1}</p>
                        </div>
                        <p className="shrink-0 text-xs font-semibold text-slate-900 dark:text-white">{formatMoney(item.finalAmount, order.currency)}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Payment attempts</h3>
                <div className="space-y-2">
                  {(detail.payments || []).length === 0 ? (
                    <p className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">No payment attempts are attached to this order.</p>
                  ) : (
                    detail.payments.map((payment) => (
                      <div key={payment.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[10px] text-slate-500">{shortId(payment.id)}</span>
                          <StatusBadge status={payment.status} />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</p>
                          <span className="text-[10px] text-slate-500">{payment.method || payment.provider || 'Payment provider'}</span>
                        </div>
                        <p className="mt-2 break-all text-[10px] text-slate-500">Provider payment ID: {payment.providerPaymentId || '—'}</p>
                        {payment.failureReason && <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{payment.failureReason}</p>}
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Refunds</h3>
                <div className="space-y-2">
                  {(detail.refunds || []).length === 0 ? (
                    <p className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">No refunds have been requested for this order.</p>
                  ) : (
                    detail.refunds.map((refund) => (
                      <div key={refund.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(refund.amount, refund.currency)}</p>
                          <StatusBadge status={refund.status} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{refund.reason || 'No reason supplied'}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{formatDate(refund.requestedAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          <section className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Clock3 size={15} /> Audit timeline
            </h3>
            {timelineLoading ? (
              <p className="text-xs text-slate-500">Loading timeline…</p>
            ) : !Array.isArray(timeline) || timeline.length === 0 ? (
              <p className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">No timeline events were returned for this order.</p>
            ) : (
              <div className="space-y-0">
                {timeline.map((entry, index) => (
                  <div key={`${entry.at || 'event'}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                    <div className="relative flex w-3 shrink-0 justify-center">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                      {index < timeline.length - 1 && <span className="absolute top-4 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{entry.action || 'Event'}</p>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{entry.actorType || 'System'} · {entry.actorId || '—'} · {formatDate(entry.at)}</p>
                      {entry.reason && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function RefundDialog({ payment, onClose }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    currentData: refundable,
    isLoading: refundableLoading,
    isError: refundableError,
  } = useGetAdminRefundableAmountQuery(payment?.id, {
    skip: !payment?.id,
  });

  const [requestRefund, { isLoading: refundSubmitting }] = useRequestAdminRefundMutation();

  if (!payment) {
    return null;
  }

  const maxRefundable = Number(refundable?.refundable || 0);
  const amountInMinorUnits = Math.round(Number(amount) * 100);
  const validAmount = Number.isFinite(amountInMinorUnits) && amountInMinorUnits > 0 && amountInMinorUnits <= maxRefundable;
  const validReason = reason.trim().length >= 3 && reason.trim().length <= 500;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validAmount) {
      setErrorMessage('Enter a refund amount greater than zero and no higher than the currently refundable balance.');
      return;
    }

    if (!validReason) {
      setErrorMessage('Enter a reason between 3 and 500 characters.');
      return;
    }

    if (typeof window === 'undefined' || !window.crypto?.randomUUID) {
      setErrorMessage('This browser cannot generate a secure idempotency key. Please use a supported browser.');
      return;
    }

    try {
      await requestRefund({
        paymentId: payment.id,
        amount: amountInMinorUnits,
        reason: reason.trim(),
        idempotencyKey: window.crypto.randomUUID(),
      }).unwrap();

      setSuccessMessage('Refund request submitted. Its final state will be determined by the payment service.');
      setAmount('');
      setReason('');
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Unable to submit the refund request. Refresh the refundable balance and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5">
      <button type="button" aria-label="Close refund dialog" onClick={onClose} className="absolute inset-0 bg-slate-950/50" />
      <div role="dialog" aria-modal="true" aria-labelledby="refund-dialog-title" className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="refund-dialog-title" className="text-base font-semibold text-slate-900 dark:text-white">Request a refund</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Payment {shortId(payment.id)} · {formatMoney(payment.amount, payment.currency)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {refundableLoading ? (
            <p className="text-xs text-slate-500">Loading refundable balance…</p>
          ) : refundableError ? (
            <ErrorNotice title="Unable to calculate refundable balance" message="The refund form is disabled until the payment service returns the current refundable amount." />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Currently refundable</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(refundable?.refundable, payment.currency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Already refunded</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatMoney(refundable?.refunded, payment.currency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Refunds in progress</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatMoney(refundable?.inFlight, payment.currency)}</span>
              </div>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Refund amount (₹)</span>
            <input type="number" min="0.01" step="0.01" max={(maxRefundable / 100).toFixed(2)} value={amount} onChange={(event) => setAmount(event.target.value)} disabled={refundableLoading || refundableError || maxRefundable <= 0 || refundSubmitting || Boolean(successMessage)} placeholder="Enter amount in rupees" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-[10px] text-slate-400">The UI converts rupees to minor units before submitting; the backend remains authoritative.</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Reason</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} rows={3} disabled={refundSubmitting || Boolean(successMessage)} placeholder="Explain why this refund is being requested…" className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-right text-[10px] text-slate-400">{reason.length}/500</span>
          </label>

          {errorMessage && <ErrorNotice title="Refund request not submitted" message={errorMessage} />}
          {successMessage && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">{successMessage}</div>}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{successMessage ? 'Close' : 'Cancel'}</button>
            {!successMessage && (
              <button type="submit" disabled={refundableLoading || refundableError || maxRefundable <= 0 || refundSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {refundSubmitting && <LoaderCircle size={14} className="animate-spin" />}
                Submit refund request
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentsDashboardPage() {
  const [activeTab, setActiveTab] = useState('payments');
  const [page, setPage] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const normalizedSearch = appliedSearch.trim();

  const paymentFilters = useMemo(() => {
    const filters = {
      page,
      size: PAGE_SIZE,
      status: appliedStatus || undefined,
    };

    // The existing payment API supports UUID order/user IDs and provider payment IDs.
    // Do not pass arbitrary text into UUID-typed query parameters.
    if (normalizedSearch && normalizedSearch.length <= 128) {
      if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(normalizedSearch)) {
        filters.orderId = normalizedSearch;
        filters.userId = normalizedSearch;
      } else {
        filters.providerPaymentId = normalizedSearch;
      }
    }

    return filters;
  }, [page, appliedStatus, normalizedSearch]);

  const orderFilters = useMemo(() => ({
    page,
    size: PAGE_SIZE,
    status: appliedStatus || undefined,
    orderNumber: normalizedSearch || undefined,
  }), [page, appliedStatus, normalizedSearch]);

  const refundFilters = useMemo(() => ({
    page,
    size: PAGE_SIZE,
    status: appliedStatus || undefined,
  }), [page, appliedStatus]);

  const paymentsQuery = useGetAdminPaymentsQuery(paymentFilters, {
    skip: activeTab !== 'payments',
  });

  const ordersQuery = useGetAdminOrdersQuery(orderFilters, {
    skip: activeTab !== 'orders',
  });

  const refundsQuery = useGetAdminRefundsQuery(refundFilters, {
    skip: activeTab !== 'refunds',
  });

  const currentQuery = activeTab === 'payments'
    ? paymentsQuery
    : activeTab === 'orders'
      ? ordersQuery
      : refundsQuery;

  const pageData = currentQuery.currentData;
  const records = Array.isArray(pageData?.content) ? pageData.content : [];

  const currentPageMetrics = useMemo(() => {
    if (activeTab === 'payments') {
      const captured = records.filter((item) => item.status === 'CAPTURED');
      const failed = records.filter((item) => item.status === 'FAILED');
      const capturedMinorUnits = captured.reduce((total, item) => total + Number(item.amount || 0), 0);

      return {
        first: formatMoney(capturedMinorUnits, captured[0]?.currency || 'INR'),
        firstLabel: 'Captured on this page',
        second: String(captured.length),
        secondLabel: 'Captured transactions on this page',
        third: String(failed.length),
        thirdLabel: 'Failed transactions on this page',
      };
    }

    if (activeTab === 'orders') {
      const paid = records.filter((item) => ['PAID', 'FULFILLED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(item.status));
      const totalMinorUnits = paid.reduce((total, item) => total + Number(item.total || 0), 0);

      return {
        first: formatMoney(totalMinorUnits, paid[0]?.currency || 'INR'),
        firstLabel: 'Paid-order value on this page',
        second: String(paid.length),
        secondLabel: 'Paid orders on this page',
        third: String(records.filter((item) => item.status === 'PAYMENT_REVIEW').length),
        thirdLabel: 'Orders under review on this page',
      };
    }

    return {
      first: String(records.filter((item) => item.status === 'SUCCEEDED').length),
      firstLabel: 'Successful refunds on this page',
      second: String(records.filter((item) => ['REQUESTED', 'PROCESSING'].includes(item.status)).length),
      secondLabel: 'Refunds in progress on this page',
      third: String(records.filter((item) => item.status === 'FAILED').length),
      thirdLabel: 'Failed refunds on this page',
    };
  }, [activeTab, records]);

  const applyFilters = () => {
    setPage(0);
    setAppliedSearch(searchDraft.trim());
    setAppliedStatus(statusDraft);
  };

  const clearFilters = () => {
    setPage(0);
    setSearchDraft('');
    setStatusDraft('');
    setAppliedSearch('');
    setAppliedStatus('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setPage(0);
    setSearchDraft('');
    setStatusDraft('');
    setAppliedSearch('');
    setAppliedStatus('');
    setSelectedOrderId(null);
    setSelectedPayment(null);
  };

  const statusOptions = activeTab === 'payments'
    ? PAYMENT_STATUSES
    : activeTab === 'orders'
      ? ORDER_STATUSES
      : REFUND_STATUSES;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-300">
            <ShieldCheck size={13} /> Commerce administration
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Payments</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">Manage user transactions, orders, refund requests and payment history from the existing payment service.</p>
        </div>

        <button type="button" onClick={() => currentQuery.refetch()} disabled={currentQuery.isFetching} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <RefreshCw size={14} className={currentQuery.isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label={currentTabLabel(activeTab, 1)} value={currentPageMetrics.first} description="Current filtered page only; not platform-wide totals." icon={activeTab === 'payments' ? CreditCard : activeTab === 'orders' ? ShoppingCart : RotateCcw} />
        <MetricCard label={currentTabLabel(activeTab, 2)} value={currentPageMetrics.second} description="Based on records returned for this page." icon={CheckCircle2} />
        <MetricCard label={currentTabLabel(activeTab, 3)} value={currentPageMetrics.third} description="Based on records returned for this page." icon={AlertCircle} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
            {[
              { id: 'payments', label: 'Transactions', icon: CreditCard },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'refunds', label: 'Refunds', icon: RotateCcw },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button key={tab.id} type="button" onClick={() => switchTab(tab.id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <form onSubmit={(event) => { event.preventDefault(); applyFilters(); }} className="flex min-w-0 gap-2">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={activeTab === 'payments' ? 'Provider payment ID or UUID' : activeTab === 'orders' ? 'Order number' : 'Filter by status'} className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </div>
              <button type="submit" className="h-9 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700">Search</button>
            </form>

            <button type="button" onClick={() => setShowFilters((current) => !current)} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold ${showFilters || appliedStatus ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
              <Filter size={14} /> Status
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
            <label className="block max-w-sm flex-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Status</span>
              <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option value="">All statuses</option>
                {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Clear</button>
              <button type="button" onClick={applyFilters} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Apply filters</button>
            </div>
          </div>
        )}

        {(appliedSearch || appliedStatus) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <span className="text-[10px] text-slate-400">Active filters</span>
            {appliedSearch && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{appliedSearch}</span>}
            {appliedStatus && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{appliedStatus}</span>}
            <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-rose-600"><X size={12} /> Clear all</button>
          </div>
        )}

        {currentQuery.isError && (
          <div className="p-4">
            <ErrorNotice title="Unable to load payment records" message="Confirm that the payment service is running, the gateway routes /payments-api/** correctly, and the current account has admin permissions. Then retry." />
          </div>
        )}

        <div className="overflow-x-auto">
          {activeTab === 'payments' && (
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-950/40">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-4 py-3">Payment</th><th className="px-4 py-3">Order / User</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Captured / Created</th><th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentQuery.isLoading ? <tr><td colSpan={7}><LoadingRows columns={7} /></td></tr> : records.length === 0 ? <tr><td colSpan={7}><EmptyState title="No payment transactions found" message="Try clearing the filters or checking a different payment ID." /></td></tr> : records.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/40">
                    <td className="px-4 py-3"><p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{shortId(payment.id)}</p><p className="mt-1 text-[10px] text-slate-400">{payment.method || 'Method not reported'}</p></td>
                    <td className="px-4 py-3"><p className="font-mono text-xs text-slate-700 dark:text-slate-300">{shortId(payment.orderId)}</p><p className="mt-1 font-mono text-[10px] text-slate-400">User ID unavailable in payment response</p></td>
                    <td className="px-4 py-3"><p className="text-xs font-medium text-slate-700 dark:text-slate-300">{payment.provider || '—'}</p><p className="mt-1 max-w-[180px] truncate font-mono text-[10px] text-slate-400">{payment.providerPaymentId || payment.providerOrderId || 'No provider reference'}</p></td>
                    <td className="px-4 py-3"><p className="text-xs font-semibold text-slate-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</p>{Number(payment.refundedAmount) > 0 && <p className="mt-1 text-[10px] text-violet-600 dark:text-violet-300">Refunded {formatMoney(payment.refundedAmount, payment.currency)}</p>}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} />{payment.failureReason && <p className="mt-1 max-w-[180px] truncate text-[10px] text-rose-600 dark:text-rose-300" title={payment.failureReason}>{payment.failureReason}</p>}</td>
                    <td className="px-4 py-3"><p className="text-xs text-slate-700 dark:text-slate-300">{formatDate(payment.capturedAt || payment.createdAt)}</p><p className="mt-1 text-[10px] text-slate-400">{payment.capturedAt ? 'Captured' : 'Created'}</p></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedOrderId(payment.orderId)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"><Eye size={13} /> Order</button>{['CAPTURED', 'PARTIALLY_REFUNDED'].includes(payment.status) && <button type="button" onClick={() => setSelectedPayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-2.5 py-2 text-[10px] font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"><RotateCcw size={13} /> Refund</button>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'orders' && (
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-950/40">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-4 py-3">Order</th><th className="px-4 py-3">User ID</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Coupon</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {currentQuery.isLoading ? <tr><td colSpan={7}><LoadingRows columns={7} /></td></tr> : records.length === 0 ? <tr><td colSpan={7}><EmptyState title="No orders found" message="Try a different order number or clear the filters." /></td></tr> : records.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/40">
                    <td className="px-4 py-3"><p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{order.orderNumber || shortId(order.id)}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{shortId(order.id)}</p></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{shortId(order.userId)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{order.couponCode || '—'}</td>
                    <td className="px-4 py-3"><p className="text-xs font-semibold text-slate-900 dark:text-white">{formatMoney(order.total, order.currency)}</p>{Number(order.refundedAmount) > 0 && <p className="mt-1 text-[10px] text-violet-600 dark:text-violet-300">Refunded {formatMoney(order.refundedAmount, order.currency)}</p>}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedOrderId(order.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"><Eye size={13} /> Inspect order</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'refunds' && (
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-950/40">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-4 py-3">Refund</th><th className="px-4 py-3">Payment / Order</th><th className="px-4 py-3">Requested by</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3 text-right">Order</th>
                </tr>
              </thead>
              <tbody>
                {currentQuery.isLoading ? <tr><td colSpan={8}><LoadingRows columns={8} /></td></tr> : records.length === 0 ? <tr><td colSpan={8}><EmptyState title="No refund requests found" message="Refunds will appear here after they are requested through the payment service." /></td></tr> : records.map((refund) => (
                  <tr key={refund.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{shortId(refund.id)}</td>
                    <td className="px-4 py-3"><p className="font-mono text-xs text-slate-700 dark:text-slate-300">{shortId(refund.paymentId)}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{shortId(refund.orderId)}</p></td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{shortId(refund.requestedBy)}</td>
                    <td className="max-w-[220px] px-4 py-3 text-xs text-slate-600 dark:text-slate-300"><span className="line-clamp-2">{refund.reason || '—'}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white">{formatMoney(refund.amount, refund.currency)}</td>
                    <td className="px-4 py-3"><StatusBadge status={refund.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(refund.requestedAt)}</td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedOrderId(refund.orderId)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"><Eye size={13} /> Order</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination pageData={pageData} page={page} setPage={setPage} isFetching={currentQuery.isFetching} />
      </div>

      <div className="flex flex-wrap items-start gap-2 px-1 text-[10px] leading-5 text-slate-400 dark:text-slate-500">
        <ShieldCheck size={13} className="mt-1 shrink-0" />
        <p>Payment states, refundable balances and final refund outcomes come from Baahubali. The dashboard submits refund requests; it does not mark refunds as successful itself. Summary cards above intentionally describe the current page, not global financial totals.</p>
      </div>

      {selectedOrderId && <OrderDetailsDrawer orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
      {selectedPayment && <RefundDialog payment={selectedPayment} onClose={() => setSelectedPayment(null)} />}
    </div>
  );
}

function currentTabLabel(tab, index) {
  const labels = {
    payments: ['Captured value on this page', 'Captured transactions', 'Failed transactions'],
    orders: ['Paid-order value on this page', 'Paid orders', 'Orders under review'],
    refunds: ['Successful refunds', 'Refunds in progress', 'Failed refunds'],
  };

  return labels[tab]?.[index - 1] || 'Records';
}