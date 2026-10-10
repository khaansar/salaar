
import { apiSlice } from './apiSlice';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductByReference: builder.query({
      query: ({ type, referenceId }) => ({
        url: '/payments-api/products/by-reference',
        method: 'GET',
        params: {
          type,
          referenceId,
        },
      }),
      providesTags: (result, error, arg) => [
        {
          type: 'PaymentProduct',
          id: `${arg.type}:${arg.referenceId}`,
        },
      ],
    }),

    quoteCheckout: builder.mutation({
      query: ({ productId, couponCode }) => ({
        url: '/payments-api/checkout/quote',
        method: 'POST',
        data: {
          productId,
          couponCode: couponCode || null,
        },
      }),
    }),

    createPaymentOrder: builder.mutation({
      query: ({ productId, couponCode, idempotencyKey }) => ({
        url: '/payments-api/orders',
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        data: {
          productId,
          couponCode: couponCode || null,
        },
      }),
      invalidatesTags: ['Orders'],
    }),

    verifyPayment: builder.mutation({
      query: ({ paymentId, providerPaymentId, signature }) => ({
        url: `/payments-api/payments/${paymentId}/verify`,
        method: 'POST',
        data: {
          providerPaymentId,
          signature,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        {
          type: 'Payment',
          id: arg.paymentId,
        },
        'Orders',
        'Entitlements',
      ],
    }),

    getPaymentStatus: builder.query({
      query: (paymentId) => ({
        url: `/payments-api/payments/${paymentId}`,
        method: 'GET',
      }),
      providesTags: (result, error, paymentId) => [
        {
          type: 'Payment',
          id: paymentId,
        },
      ],
    }),

    getMyOrders: builder.query({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: '/payments-api/orders',
        method: 'GET',
        params: {
          page,
          size,
        },
      }),
      providesTags: ['Orders'],
    }),

    getMyOrder: builder.query({
      query: (orderId) => ({
        url: `/payments-api/orders/${orderId}`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [
        {
          type: 'Orders',
          id: orderId,
        },
      ],
    }),

    cancelPaymentOrder: builder.mutation({
      query: (orderId) => ({
        url: `/payments-api/orders/${orderId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders', 'Entitlements'],
    }),

    getMyEntitlements: builder.query({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: '/payments-api/entitlements',
        method: 'GET',
        params: {
          page,
          size,
        },
      }),
      providesTags: ['Entitlements'],
    }),
  }),
});

export const {
  useGetProductByReferenceQuery,
  useLazyGetProductByReferenceQuery,
  useQuoteCheckoutMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetPaymentStatusQuery,
  useLazyGetPaymentStatusQuery,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useCancelPaymentOrderMutation,
  useGetMyEntitlementsQuery,
} = paymentApi;
