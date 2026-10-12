import { apiSlice } from './apiSlice';

function readPage(response) {
  if (Array.isArray(response?.content)) return response;
  if (Array.isArray(response?.data?.content)) return response.data;
  return { content: [], totalPages: 0 };
}

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductByReference: builder.query({
      query: ({ type, referenceId }) => ({
        url: '/payments-api/products/by-reference',
        method: 'GET',
        params: { type, referenceId },
      }),
      providesTags: (result, error, arg) => [{ type: 'PaymentProduct', id: `${arg.type}:${arg.referenceId}` }],
    }),
    quoteCheckout: builder.mutation({
      query: ({ productId, couponCode }) => ({
        url: '/payments-api/checkout/quote',
        method: 'POST',
        data: { productId, couponCode: couponCode || null },
      }),
    }),
    createPaymentOrder: builder.mutation({
      query: ({ productId, couponCode, idempotencyKey }) => ({
        url: '/payments-api/orders',
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        data: { productId, couponCode: couponCode || null },
      }),
      invalidatesTags: ['Orders'],
    }),
    verifyPayment: builder.mutation({
      query: ({ paymentId, providerPaymentId, signature }) => ({
        url: `/payments-api/payments/${paymentId}/verify`,
        method: 'POST',
        data: { providerPaymentId, signature },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Payment', id: arg.paymentId }, 'Orders', 'Entitlements'],
    }),
    getPaymentStatus: builder.query({
      query: (paymentId) => ({ url: `/payments-api/payments/${paymentId}`, method: 'GET' }),
      providesTags: (result, error, paymentId) => [{ type: 'Payment', id: paymentId }],
    }),
    getMyOrders: builder.query({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: '/payments-api/orders', method: 'GET', params: { page, size },
      }),
      providesTags: ['Orders'],
    }),
    getMyOrder: builder.query({
      query: (orderId) => ({ url: `/payments-api/orders/${orderId}`, method: 'GET' }),
      providesTags: (result, error, orderId) => [{ type: 'Orders', id: orderId }],
    }),
    cancelPaymentOrder: builder.mutation({
      query: (orderId) => ({ url: `/payments-api/orders/${orderId}/cancel`, method: 'POST' }),
      invalidatesTags: ['Orders', 'Entitlements'],
    }),
    getMyEntitlements: builder.query({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: '/payments-api/entitlements', method: 'GET', params: { page, size },
      }),
      providesTags: ['Entitlements'],
    }),

    // Fetch every page so an entitlement is not missed just because it falls
    // after page 0. apiSlice's Axios baseQuery returns the unwrapped PageResponse.
    getAllMyEntitlements: builder.query({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const size = 100;
        const firstResponse = await baseQuery({
          url: '/payments-api/entitlements',
          method: 'GET',
          params: { page: 0, size },
        });
        if (firstResponse.error) return { error: firstResponse.error };

        const firstPage = readPage(firstResponse.data);
        if (!Array.isArray(firstPage.content)) {
          return { error: { status: 'CUSTOM_ERROR', error: 'Unexpected entitlements response shape' } };
        }

        const all = [...firstPage.content];
        const totalPages = Math.max(1, Number(firstPage.totalPages) || 1);

        for (let page = 1; page < totalPages; page += 1) {
          const nextResponse = await baseQuery({
            url: '/payments-api/entitlements',
            method: 'GET',
            params: { page, size },
          });
          if (nextResponse.error) return { error: nextResponse.error };
          const nextPage = readPage(nextResponse.data);
          if (!Array.isArray(nextPage.content)) {
            return { error: { status: 'CUSTOM_ERROR', error: `Unexpected entitlements response on page ${page}` } };
          }
          all.push(...nextPage.content);
        }

        return { data: all };
      },
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
  useGetAllMyEntitlementsQuery,
} = paymentApi;
