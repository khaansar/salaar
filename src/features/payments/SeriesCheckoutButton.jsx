
'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  Tag,
} from 'lucide-react';

import {
  useLazyGetProductByReferenceQuery,
  useQuoteCheckoutMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetPaymentStatusQuery,
} from '../../store/paymentApi';

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Checkout is only available in the browser.'));
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout. Please try again.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout. Please check your connection and try again.'));
    document.body.appendChild(script);
  });
}

function formatMinorAmount(amount, currency = 'INR') {
  if (amount == null || !Number.isFinite(Number(amount))) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) / 100);
}

function createIdempotencyKey() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function SeriesCheckoutButton({
  seriesId,
  seriesTitle,
  className = '',
}) {
  const [couponCode, setCouponCode] = useState('');
  const [productId, setProductId] = useState(null);
  const [quote, setQuote] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [getProductByReference] = useLazyGetProductByReferenceQuery();
  const [quoteCheckout] = useQuoteCheckoutMutation();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const {
    currentData: latestPaymentStatus,
    isError: isPaymentStatusError,
  } = useGetPaymentStatusQuery(paymentId, {
    skip: !paymentId || !paymentPending,
    pollingInterval: paymentPending ? 2500 : 0,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!latestPaymentStatus || !paymentPending) {
      return;
    }

    if (latestPaymentStatus.resultState === 'SUCCESS') {
      setPaymentPending(false);
      setStatusMessage('Payment confirmed. Your test series is now unlocked.');
      setErrorMessage('');
      return;
    }

    if (latestPaymentStatus.resultState === 'FAILED') {
      setPaymentPending(false);
      setStatusMessage('');
      setErrorMessage(
        latestPaymentStatus.failureReason || 'The payment was not completed. You can try again.'
      );
    }
  }, [latestPaymentStatus, paymentPending]);

  useEffect(() => {
    if (isPaymentStatusError && paymentPending) {
      setStatusMessage('We are still checking your payment. Please keep this page open and try again shortly.');
    }
  }, [isPaymentStatusError, paymentPending]);

  const fetchProductAndQuote = async () => {
    if (!seriesId) {
      throw new Error('The test series ID is missing. Please refresh the page and try again.');
    }

    const product = await getProductByReference({
      type: 'TEST_SERIES',
      referenceId: seriesId,
    }).unwrap();

    if (!product?.id) {
      throw new Error('This test series is not available for purchase yet. Please try again later.');
    }

    setProductId(product.id);

    const freshQuote = await quoteCheckout({
      productId: product.id,
      couponCode: couponCode.trim() || null,
    }).unwrap();

    setQuote(freshQuote);

    return {
      product,
      quote: freshQuote,
    };
  };

  const handleApplyCoupon = async () => {
    setErrorMessage('');
    setStatusMessage('');
    setIsLoading(true);

    try {
      const { quote: freshQuote } = await fetchProductAndQuote();

      setStatusMessage(
        couponCode.trim()
          ? `Price updated. Your quoted total is ${formatMinorAmount(freshQuote.price?.total, freshQuote.price?.currency)}.`
          : `Current price: ${formatMinorAmount(freshQuote.price?.total, freshQuote.price?.currency)}.`
      );
    } catch (error) {
      setQuote(null);
      setErrorMessage(error?.message || 'Unable to calculate the current price. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setErrorMessage('');
    setStatusMessage('');
    setIsLoading(true);

    try {
      // Load Checkout before creating the order, so a script-loading failure
      // does not leave a newly created order with no checkout UI to open.
      await loadRazorpayScript();

      const { product } = await fetchProductAndQuote();

      // The backend recalculates the actual price and validates the coupon
      // again while creating the order. The quote is only for display.
      const order = await createPaymentOrder({
        productId: product.id,
        couponCode: couponCode.trim() || null,
        idempotencyKey: createIdempotencyKey(),
      }).unwrap();

      if (!order?.providerOrderId || !order?.paymentId || !order?.providerKeyId) {
        throw new Error('The payment service returned an incomplete checkout order. Please contact support if this continues.');
      }

      const options = {
        key: order.providerKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Baahubali',
        description: `Access to ${seriesTitle || 'test series'}`,
        order_id: order.providerOrderId,
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            // Dismissing the modal is not proof that no payment occurred.
            // Check the server-side state instead of marking it failed.
            setPaymentId(order.paymentId);
            setPaymentPending(true);
            setStatusMessage('Checkout was closed. If you completed a payment, we are checking its final status.');
          },
        },
        handler: async (response) => {
          setPaymentId(order.paymentId);
          setPaymentPending(true);
          setStatusMessage('Payment submitted. Verifying with the payment service...');

          try {
            const verification = await verifyPayment({
              paymentId: order.paymentId,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }).unwrap();

            if (verification?.resultState === 'SUCCESS') {
              setPaymentPending(false);
              setStatusMessage('Payment confirmed. Your test series is now unlocked.');
              setErrorMessage('');
            } else if (verification?.resultState === 'FAILED') {
              setPaymentPending(false);
              setStatusMessage('');
              setErrorMessage(verification.failureReason || 'The payment was not completed. You can try again.');
            } else {
              setStatusMessage('Your payment is being confirmed. We will update this page when the server confirms the result.');
            }
          } catch (error) {
            // Verification can fail temporarily even when the provider is
            // processing a real attempt. Continue checking the backend state.
            setStatusMessage('We could not confirm the result immediately. We are checking the payment status with the server.');
            setErrorMessage('');
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response) => {
        setPaymentId(order.paymentId);
        setPaymentPending(true);
        setStatusMessage('The checkout reported a failed attempt. We are checking the final payment status.');
        setErrorMessage('');
      });

      razorpay.open();
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to start checkout. Please try again.');
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedQuote = quote?.price?.total != null
    ? formatMinorAmount(quote.price.total, quote.price.currency || 'INR')
    : null;

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <label htmlFor={`coupon-${seriesId}`} className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Tag size={14} className="text-brand-600" />
          Coupon code (optional)
        </label>

        <div className="flex gap-2">
          <input
            id={`coupon-${seriesId}`}
            type="text"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            maxLength={64}
            placeholder="Enter coupon code"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            disabled={isLoading || paymentPending}
          />

          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isLoading || paymentPending}
            className="shrink-0 rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-indigo-500/10"
          >
            Apply
          </button>
        </div>

        {displayedQuote && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Quoted total</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{displayedQuote}</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div role="status" className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs leading-5 text-indigo-800 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {statusMessage.includes('now unlocked') ? (
        <a
          href="#tests"
          className={`flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 ${className}`}
        >
          <CheckCircle2 size={16} />
          View Tests
          <ArrowRight size={15} />
        </a>
      ) : (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isLoading || paymentPending}
          className={`flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
          {isLoading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Preparing secure checkout...
            </>
          ) : paymentPending ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Confirming payment...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Buy Now & Start Practicing
              <ArrowRight size={15} />
            </>
          )}
        </button>
      )}

      <p className="flex items-start gap-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        Secure checkout. Your access is granted after the payment service confirms the transaction.
      </p>
    </div>
  );
}
