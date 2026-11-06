'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  X,
  Package,
  Wallet,
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
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination, zeroBasedMeta } from '@/components/ui/Pagination';
import { StatCard } from '@/components/admin/StatCard';
import {
  ADMIN_TABLE,
  DetailRow,
  DetailSection,
  InlineAlert,
  SegmentedTabs,
  StatusBadge as BaseStatusBadge,
} from '@/components/admin/AdminUi';

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


function StatusBadge({ status }) {
  return <BaseStatusBadge status={status} styles={STATUS_STYLES} fallback={null} />;
}

function ErrorNotice({ title, message }) {
  return <InlineAlert tone="danger" title={title}>{message}</InlineAlert>;
}

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300';
const REFUND_BUTTON =
  'inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10';

function TableState({ colSpan, loading, empty, emptyTitle, emptyMessage }) {
  if (loading) {
    return (
      <tr>
        <td colSpan={colSpan}>
          <TableSkeleton rows={6} cols={Math.min(colSpan, 6)} />
        </td>
      </tr>
    );
  }
  if (empty) {
    return (
      <tr>
        <td colSpan={colSpan}>
          <EmptyState icon={<Search size={20} />} title={emptyTitle} description={emptyMessage} />
        </td>
      </tr>
    );
  }
  return null;
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
    <Drawer
      open
      onClose={onClose}
      title={order?.orderNumber || shortId(orderId)}
      description="Order, payment attempts, refunds and timeline"
      width="xl"
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        )}
        {isError && <ErrorNotice title="Unable to load this order" message="Check the payment service and try again." />}

        {order && (
          <>
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Order total</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatMoney(order.total, order.currency)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
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

            <DetailSection title="Purchased items" icon={Package}>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {(order.items || []).length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 dark:text-slate-400">No item details were returned for this order.</p>
                ) : (
                  order.items.map((item, index) => (
                    <div key={`${item.productId || 'item'}-${index}`} className="flex items-start justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name || item.productType || 'Product'}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.productType || '—'} · Qty {item.quantity ?? 1}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(item.finalAmount, order.currency)}</p>
                    </div>
                  ))
                )}
              </div>
            </DetailSection>

            <DetailSection title="Payment attempts" icon={CreditCard}>
              <div className="space-y-2">
                {(detail.payments || []).length === 0 ? (
                  <p className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">No payment attempts are attached to this order.</p>
                ) : (
                  detail.payments.map((payment) => (
                    <div key={payment.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{shortId(payment.id)}</span>
                        <StatusBadge status={payment.status} />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{payment.method || payment.provider || 'Payment provider'}</span>
                      </div>
                      <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">Provider payment ID: {payment.providerPaymentId || '—'}</p>
                      {payment.failureReason && <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{payment.failureReason}</p>}
                    </div>
                  ))
                )}
              </div>
            </DetailSection>

            <DetailSection title="Refunds" icon={RotateCcw}>
              <div className="space-y-2">
                {(detail.refunds || []).length === 0 ? (
                  <p className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">No refunds have been requested for this order.</p>
                ) : (
                  detail.refunds.map((refund) => (
                    <div key={refund.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(refund.amount, refund.currency)}</p>
                        <StatusBadge status={refund.status} />
                      </div>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{refund.reason || 'No reason supplied'}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDate(refund.requestedAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </DetailSection>
          </>
        )}

        <DetailSection title="Audit timeline" icon={Clock3}>
          {timelineLoading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : !Array.isArray(timeline) || timeline.length === 0 ? (
            <p className="rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">No timeline events were returned for this order.</p>
          ) : (
            <ol>
              {timeline.map((entry, index) => (
                <li key={`${entry.at || 'event'}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className="relative flex w-3 shrink-0 justify-center">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                    {index < timeline.length - 1 && <span className="absolute bottom-0 top-4 w-px bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{entry.action || 'Event'}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{entry.actorType || 'System'} · {entry.actorId || '—'} · {formatDate(entry.at)}</p>
                    {entry.reason && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{entry.reason}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </DetailSection>
      </div>
    </Drawer>
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

  const formDisabled = refundableLoading || refundableError || maxRefundable <= 0 || refundSubmitting;

  return (
    <Modal
      open
      onClose={onClose}
      title="Request a refund"
      description={`Payment ${shortId(payment.id)} · ${formatMoney(payment.amount, payment.currency)}`}
      width="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>{successMessage ? 'Close' : 'Cancel'}</Button>
          {!successMessage && (
            <Button type="submit" form="refund-form" isLoading={refundSubmitting} disabled={formDisabled}>
              Submit refund request
            </Button>
          )}
        </>
      }
    >
      <form id="refund-form" onSubmit={handleSubmit} className="space-y-4">
        {refundableLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : refundableError ? (
          <ErrorNotice title="Unable to calculate refundable balance" message="The refund form is disabled until the payment service returns the current refundable amount." />
        ) : (
          <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Refundable now</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{formatMoney(refundable?.refundable, payment.currency)}</p>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Already refunded</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{formatMoney(refundable?.refunded, payment.currency)}</p>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">In progress</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{formatMoney(refundable?.inFlight, payment.currency)}</p>
            </div>
          </div>
        )}

        <Input
          id="refund-amount"
          label="Refund amount (₹)"
          type="number"
          min="0.01"
          step="0.01"
          max={(maxRefundable / 100).toFixed(2)}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={refundableLoading || refundableError || maxRefundable <= 0 || refundSubmitting || Boolean(successMessage)}
          placeholder="Enter amount in rupees"
          helpText="Converted to minor units before submitting; the backend remains authoritative."
        />

        <div>
          <Textarea
            id="refund-reason"
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minLength={3}
            maxLength={500}
            rows={3}
            disabled={refundSubmitting || Boolean(successMessage)}
            placeholder="Explain why this refund is being requested…"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400 dark:text-slate-500">{reason.length}/500</p>
        </div>

        {errorMessage && <ErrorNotice title="Refund request not submitted" message={errorMessage} />}
        {successMessage && <InlineAlert tone="success">{successMessage}</InlineAlert>}
      </form>
    </Modal>
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

  const TABS = [
    { value: 'payments', label: 'Transactions', icon: CreditCard },
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'refunds', label: 'Refunds', icon: RotateCcw },
  ];
  const firstMetricIcon = activeTab === 'payments' ? Wallet : activeTab === 'orders' ? ShoppingCart : RotateCcw;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Payments' }]}
        title="Payments"
        subtitle="Manage user transactions, orders, refund requests and payment history from the payment service."
        actions={
          <Button variant="outline" onClick={() => currentQuery.refetch()} disabled={currentQuery.isFetching}>
            <RefreshCw size={16} className={`mr-2 ${currentQuery.isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={currentTabLabel(activeTab, 1)} value={currentPageMetrics.first} hint="Current filtered page only" icon={firstMetricIcon} tone="indigo" loading={currentQuery.isLoading} />
        <StatCard label={currentTabLabel(activeTab, 2)} value={currentPageMetrics.second} hint="Records returned for this page" icon={CheckCircle2} tone="emerald" loading={currentQuery.isLoading} />
        <StatCard label={currentTabLabel(activeTab, 3)} value={currentPageMetrics.third} hint="Records returned for this page" icon={AlertCircle} tone="rose" loading={currentQuery.isLoading} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedTabs tabs={TABS} value={activeTab} onChange={switchTab} />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <form onSubmit={(event) => { event.preventDefault(); applyFilters(); }} className="flex min-w-0 gap-2">
              <div className="min-w-0 flex-1 sm:w-72">
                <Input
                  aria-label="Search records"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder={activeTab === 'payments' ? 'Provider payment ID or UUID' : activeTab === 'orders' ? 'Order number' : 'Search is not available for refunds'}
                  leftIcon={<Search size={16} />}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Button
              type="button"
              variant="outline"
              aria-expanded={showFilters}
              onClick={() => setShowFilters((current) => !current)}
              className={showFilters || appliedStatus ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300' : ''}
            >
              <Filter size={15} className="mr-2" /> Status
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-sm">
              <Select id="payments-status" label="Status" value={statusDraft} onChange={(event) => setStatusDraft(event.target.value)}>
                <option value="">All statuses</option>
                {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={clearFilters}>Clear</Button>
              <Button type="button" onClick={applyFilters}>Apply filters</Button>
            </div>
          </div>
        )}

        {(appliedSearch || appliedStatus) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-slate-500">Active filters</span>
            {appliedSearch && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{appliedSearch}</span>}
            {appliedStatus && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{appliedStatus.replaceAll('_', ' ')}</span>}
            <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"><X size={12} /> Clear all</button>
          </div>
        )}

        {currentQuery.isError && (
          <div className="p-4">
            <ErrorNotice title="Unable to load payment records" message="Confirm that the payment service is running, the gateway routes /payments-api/** correctly, and the current account has admin permissions. Then retry." />
          </div>
        )}

        <div className="overflow-x-auto">
          {activeTab === 'payments' && (
            <table className={`${ADMIN_TABLE.table} min-w-[1050px]`}>
              <thead>
                <tr className={ADMIN_TABLE.headRow}>
                  <th className={ADMIN_TABLE.th}>Payment</th><th className={ADMIN_TABLE.th}>Order / User</th><th className={ADMIN_TABLE.th}>Provider</th><th className={ADMIN_TABLE.th}>Amount</th><th className={ADMIN_TABLE.th}>Status</th><th className={ADMIN_TABLE.th}>Captured / Created</th><th className={`${ADMIN_TABLE.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE.body}>
                {currentQuery.isLoading || records.length === 0 ? <TableState colSpan={7} loading={currentQuery.isLoading} empty={!currentQuery.isLoading} emptyTitle="No payment transactions found" emptyMessage="Try clearing the filters or checking a different payment ID." /> : records.map((payment) => (
                  <tr key={payment.id} className={ADMIN_TABLE.row}>
                    <td className={ADMIN_TABLE.td}><p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{shortId(payment.id)}</p><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{payment.method || 'Method not reported'}</p></td>
                    <td className={ADMIN_TABLE.td}><p className="font-mono text-xs text-slate-700 dark:text-slate-300">{shortId(payment.orderId)}</p><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">User ID unavailable in payment response</p></td>
                    <td className={ADMIN_TABLE.td}><p className="text-xs font-medium text-slate-700 dark:text-slate-300">{payment.provider || '—'}</p><p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-400 dark:text-slate-500">{payment.providerPaymentId || payment.providerOrderId || 'No provider reference'}</p></td>
                    <td className={ADMIN_TABLE.td}><p className="font-semibold text-slate-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</p>{Number(payment.refundedAmount) > 0 && <p className="mt-1 text-xs text-violet-600 dark:text-violet-300">Refunded {formatMoney(payment.refundedAmount, payment.currency)}</p>}</td>
                    <td className={ADMIN_TABLE.td}><StatusBadge status={payment.status} />{payment.failureReason && <p className="mt-1 max-w-[180px] truncate text-xs text-rose-600 dark:text-rose-300" title={payment.failureReason}>{payment.failureReason}</p>}</td>
                    <td className={ADMIN_TABLE.td}><p className="whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">{formatDate(payment.capturedAt || payment.createdAt)}</p><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{payment.capturedAt ? 'Captured' : 'Created'}</p></td>
                    <td className={ADMIN_TABLE.td}><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedOrderId(payment.orderId)} className={ACTION_BUTTON}><Eye size={13} /> Order</button>{['CAPTURED', 'PARTIALLY_REFUNDED'].includes(payment.status) && <button type="button" onClick={() => setSelectedPayment(payment)} className={REFUND_BUTTON}><RotateCcw size={13} /> Refund</button>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'orders' && (
            <table className={`${ADMIN_TABLE.table} min-w-[1000px]`}>
              <thead>
                <tr className={ADMIN_TABLE.headRow}>
                  <th className={ADMIN_TABLE.th}>Order</th><th className={ADMIN_TABLE.th}>User ID</th><th className={ADMIN_TABLE.th}>Created</th><th className={ADMIN_TABLE.th}>Coupon</th><th className={ADMIN_TABLE.th}>Total</th><th className={ADMIN_TABLE.th}>Status</th><th className={`${ADMIN_TABLE.th} text-right`}>Details</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE.body}>
                {currentQuery.isLoading || records.length === 0 ? <TableState colSpan={7} loading={currentQuery.isLoading} empty={!currentQuery.isLoading} emptyTitle="No orders found" emptyMessage="Try a different order number or clear the filters." /> : records.map((order) => (
                  <tr key={order.id} className={ADMIN_TABLE.row}>
                    <td className={ADMIN_TABLE.td}><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{order.orderNumber || shortId(order.id)}</p><p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-500">{shortId(order.id)}</p></td>
                    <td className={`${ADMIN_TABLE.td} font-mono text-xs`}>{shortId(order.userId)}</td>
                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs`}>{formatDate(order.createdAt)}</td>
                    <td className={`${ADMIN_TABLE.td} text-xs`}>{order.couponCode || '—'}</td>
                    <td className={ADMIN_TABLE.td}><p className="font-semibold text-slate-900 dark:text-white">{formatMoney(order.total, order.currency)}</p>{Number(order.refundedAmount) > 0 && <p className="mt-1 text-xs text-violet-600 dark:text-violet-300">Refunded {formatMoney(order.refundedAmount, order.currency)}</p>}</td>
                    <td className={ADMIN_TABLE.td}><StatusBadge status={order.status} /></td>
                    <td className={`${ADMIN_TABLE.td} text-right`}><button type="button" onClick={() => setSelectedOrderId(order.id)} className={ACTION_BUTTON}><Eye size={13} /> Inspect order</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'refunds' && (
            <table className={`${ADMIN_TABLE.table} min-w-[950px]`}>
              <thead>
                <tr className={ADMIN_TABLE.headRow}>
                  <th className={ADMIN_TABLE.th}>Refund</th><th className={ADMIN_TABLE.th}>Payment / Order</th><th className={ADMIN_TABLE.th}>Requested by</th><th className={ADMIN_TABLE.th}>Reason</th><th className={ADMIN_TABLE.th}>Amount</th><th className={ADMIN_TABLE.th}>Status</th><th className={ADMIN_TABLE.th}>Requested</th><th className={`${ADMIN_TABLE.th} text-right`}>Order</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE.body}>
                {currentQuery.isLoading || records.length === 0 ? <TableState colSpan={8} loading={currentQuery.isLoading} empty={!currentQuery.isLoading} emptyTitle="No refund requests found" emptyMessage="Refunds will appear here after they are requested through the payment service." /> : records.map((refund) => (
                  <tr key={refund.id} className={ADMIN_TABLE.row}>
                    <td className={`${ADMIN_TABLE.td} font-mono text-xs`}>{shortId(refund.id)}</td>
                    <td className={ADMIN_TABLE.td}><p className="font-mono text-xs text-slate-700 dark:text-slate-300">{shortId(refund.paymentId)}</p><p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-500">{shortId(refund.orderId)}</p></td>
                    <td className={`${ADMIN_TABLE.td} font-mono text-xs`}>{shortId(refund.requestedBy)}</td>
                    <td className={`${ADMIN_TABLE.td} max-w-[220px] text-xs`}><span className="line-clamp-2">{refund.reason || '—'}</span></td>
                    <td className={`${ADMIN_TABLE.td} font-semibold text-slate-900 dark:text-white`}>{formatMoney(refund.amount, refund.currency)}</td>
                    <td className={ADMIN_TABLE.td}><StatusBadge status={refund.status} /></td>
                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs`}>{formatDate(refund.requestedAt)}</td>
                    <td className={`${ADMIN_TABLE.td} text-right`}><button type="button" onClick={() => setSelectedOrderId(refund.orderId)} className={ACTION_BUTTON}><Eye size={13} /> Order</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          meta={zeroBasedMeta({ page, totalPages: Math.max(pageData?.totalPages || 0, 1), totalElements: pageData?.totalElements || 0, pageSize: pageData?.size || PAGE_SIZE })}
          onPageChange={(nextPage) => setPage(Math.max(0, nextPage - 1))}
          disabled={currentQuery.isFetching}
        />
      </Card>

      <div className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <p>Payment states, refundable balances and final refund outcomes come from Baahubali. The dashboard submits refund requests; it does not mark refunds as successful itself. Summary cards above describe the current page, not global financial totals.</p>
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