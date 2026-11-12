import { apiSlice } from "./apiSlice";

const PAYMENT_BASE = "/payments-api/admin";
const REVIEW_BASE = "/community-api/admin/reviews";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ------------------------------------------------------------
    // EXISTING ADMIN ENDPOINTS — PRESERVED
    // ------------------------------------------------------------

    getSeriesList: builder.query({
      query: (params) => ({ url: "/tests-api/admin/series", params }),
      providesTags: (result) => Array.isArray(result)
        ? [...result.map(({ id }) => ({ type: "Series", id })), { type: "Series", id: "LIST" }]
        : [{ type: "Series", id: "LIST" }],
    }),

    deleteSeries: builder.mutation({
      query: (id) => ({ url: `/tests-api/admin/series/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Series", id: "LIST" }],
    }),

    getQuestionsList: builder.query({
      query: (params) => ({ url: "/tests-api/admin/questions", params }),
      providesTags: (result) => Array.isArray(result)
        ? [...result.map(({ id }) => ({ type: "Question", id })), { type: "Question", id: "LIST" }]
        : [{ type: "Question", id: "LIST" }],
    }),

    deleteQuestion: builder.mutation({
      query: (id) => ({ url: `/tests-api/admin/questions/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Question", id: "LIST" }],
    }),

    getCategoriesList: builder.query({
      query: (params) => ({ url: "/tests-api/admin/categories", params }),
      providesTags: (result) => Array.isArray(result)
        ? [...result.map(({ id }) => ({ type: "Category", id })), { type: "Category", id: "LIST" }]
        : [{ type: "Category", id: "LIST" }],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/tests-api/admin/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    getAuditLogs: builder.query({
      query: ({ actorId, action, resourceType, service, from, to, page = 0, size = 20 } = {}) => ({
        url: "/auth-api/admin/audit-logs",
        params: {
          actorId: actorId || undefined,
          action: action || undefined,
          resourceType: resourceType || undefined,
          service: service || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          size,
        },
      }),
      providesTags: (result) => {
        const logs = result?.content;
        return Array.isArray(logs)
          ? [...logs.map(({ eventId }) => ({ type: "AuditLog", id: eventId })), { type: "AuditLog", id: "LIST" }]
          : [{ type: "AuditLog", id: "LIST" }];
      },
    }),

    // ------------------------------------------------------------
    // REVIEW MODERATION
    // ------------------------------------------------------------

    getAdminReviews: builder.query({
      query: ({ status, targetType, rating, search, page = 0, size = 20 } = {}) => ({
        url: REVIEW_BASE,
        params: {
          status: status || undefined,
          targetType: targetType || undefined,
          rating: rating === "" || rating == null ? undefined : rating,
          search: search || undefined,
          page,
          size,
        },
      }),
      providesTags: (result) => {
        const reviews = Array.isArray(result) ? result : result?.content;
        return Array.isArray(reviews)
          ? [
              ...reviews.map((review) => ({
                type: "AdminReview",
                id: review.reviewId ?? review.id,
              })),
              { type: "AdminReview", id: "LIST" },
            ]
          : [{ type: "AdminReview", id: "LIST" }];
      },
    }),

    getAdminReviewStats: builder.query({
      query: () => ({ url: `${REVIEW_BASE}/stats` }),
      providesTags: [{ type: "AdminReviewStats", id: "SUMMARY" }],
    }),

    moderateReview: builder.mutation({
      query: ({ reviewId, ...moderationRequest }) => ({
        url: `${REVIEW_BASE}/${reviewId}/status`,
        method: "PATCH",
        data: moderationRequest,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "AdminReview", id: reviewId },
        { type: "AdminReview", id: "LIST" },
        { type: "AdminReviewStats", id: "SUMMARY" },
      ],
    }),

    // ------------------------------------------------------------
    // PAYMENT MANAGEMENT — BAAHUBALI ADMIN APIs
    // ------------------------------------------------------------

    getAdminPayments: builder.query({
      query: ({ orderId, userId, status, providerPaymentId, page = 0, size = 20 } = {}) => ({
        url: `${PAYMENT_BASE}/payments`,
        params: {
          orderId: orderId || undefined,
          userId: userId || undefined,
          status: status || undefined,
          providerPaymentId: providerPaymentId || undefined,
          page,
          size,
        },
      }),
      providesTags: (result) => {
        const payments = result?.content;
        return Array.isArray(payments)
          ? [...payments.map(({ id }) => ({ type: "AdminPayment", id })), { type: "AdminPayment", id: "LIST" }]
          : [{ type: "AdminPayment", id: "LIST" }];
      },
    }),

    getAdminOrders: builder.query({
      query: ({ userId, status, orderNumber, page = 0, size = 20 } = {}) => ({
        url: `${PAYMENT_BASE}/orders`,
        params: {
          userId: userId || undefined,
          status: status || undefined,
          orderNumber: orderNumber || undefined,
          page,
          size,
        },
      }),
      providesTags: (result) => {
        const orders = result?.content;
        return Array.isArray(orders)
          ? [...orders.map(({ id }) => ({ type: "AdminOrder", id })), { type: "AdminOrder", id: "LIST" }]
          : [{ type: "AdminOrder", id: "LIST" }];
      },
    }),

    getAdminOrderDetail: builder.query({
      query: (orderId) => ({ url: `${PAYMENT_BASE}/orders/${orderId}` }),
      providesTags: (result, error, orderId) => [{ type: "AdminOrder", id: orderId }],
    }),

    getAdminOrderTimeline: builder.query({
      query: (orderId) => ({ url: `${PAYMENT_BASE}/orders/${orderId}/timeline` }),
      providesTags: (result, error, orderId) => [{ type: "AdminOrderTimeline", id: orderId }],
    }),

    getAdminRefunds: builder.query({
      query: ({ orderId, status, page = 0, size = 20 } = {}) => ({
        url: `${PAYMENT_BASE}/refunds`,
        params: { orderId: orderId || undefined, status: status || undefined, page, size },
      }),
      providesTags: (result) => {
        const refunds = result?.content;
        return Array.isArray(refunds)
          ? [...refunds.map(({ id }) => ({ type: "AdminRefund", id })), { type: "AdminRefund", id: "LIST" }]
          : [{ type: "AdminRefund", id: "LIST" }];
      },
    }),

    getAdminRefundableAmount: builder.query({
      query: (paymentId) => ({ url: `${PAYMENT_BASE}/payments/${paymentId}/refundable` }),
      providesTags: (result, error, paymentId) => [{ type: "AdminRefundableAmount", id: paymentId }],
    }),

    requestAdminRefund: builder.mutation({
      query: ({ paymentId, amount, reason, idempotencyKey }) => ({
        url: `${PAYMENT_BASE}/payments/${paymentId}/refunds`,
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        data: { amount, reason },
      }),
      invalidatesTags: [
        { type: "AdminPayment", id: "LIST" },
        { type: "AdminOrder", id: "LIST" },
        { type: "AdminRefund", id: "LIST" },
        { type: "AdminRefundableAmount", id: "LIST" },
      ],
    }),

    // ------------------------------------------------------------
    // PRODUCT CATALOG, SERIES ACCESS AND COUPONS
    // ------------------------------------------------------------

    getAdminProducts: builder.query({
      query: ({ type, q, ids, referenceIds, paidOnly, page = 0, size = 20 } = {}) => ({
        url: `${PAYMENT_BASE}/products`,
        params: {
          type: type || undefined,
          q: q || undefined,
          // Spring binds comma-separated values to List<UUID>; axios would otherwise send ids[]=…
          ids: ids?.length ? ids.join(",") : undefined,
          referenceIds: referenceIds?.length ? referenceIds.join(",") : undefined,
          paidOnly: paidOnly || undefined,
          page,
          size,
        },
      }),
      providesTags: [{ type: "AdminProduct", id: "LIST" }],
    }),

    getAdminEntitlements: builder.query({
      query: ({ userId, status, page = 0, size = 20 } = {}) => ({
        url: `${PAYMENT_BASE}/entitlements`,
        params: { userId: userId || undefined, status: status || undefined, page, size },
      }),
      providesTags: [{ type: "AdminEntitlement", id: "LIST" }],
    }),

    grantAdminEntitlement: builder.mutation({
      query: (body) => ({ url: `${PAYMENT_BASE}/entitlements/grant`, method: "POST", data: body }),
      invalidatesTags: [{ type: "AdminEntitlement", id: "LIST" }],
    }),

    revokeAdminEntitlement: builder.mutation({
      query: ({ id, reason }) => ({ url: `${PAYMENT_BASE}/entitlements/${id}/revoke`, method: "POST", data: { reason } }),
      invalidatesTags: [{ type: "AdminEntitlement", id: "LIST" }],
    }),

    getAdminCoupons: builder.query({
      query: ({ q, page = 0, size = 20 } = {}) => ({
        url: `${PAYMENT_BASE}/coupons`,
        params: { q: q || undefined, page, size },
      }),
      providesTags: (result) => {
        const coupons = result?.content;
        return Array.isArray(coupons)
          ? [...coupons.map(({ id }) => ({ type: "AdminCoupon", id })), { type: "AdminCoupon", id: "LIST" }]
          : [{ type: "AdminCoupon", id: "LIST" }];
      },
    }),

    createAdminCoupon: builder.mutation({
      query: (body) => ({ url: `${PAYMENT_BASE}/coupons`, method: "POST", data: body }),
      invalidatesTags: [{ type: "AdminCoupon", id: "LIST" }],
    }),

    updateAdminCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${PAYMENT_BASE}/coupons/${id}`, method: "PUT", data: body }),
      invalidatesTags: (result, error, { id }) => [{ type: "AdminCoupon", id }, { type: "AdminCoupon", id: "LIST" }],
    }),

    setAdminCouponEnabled: builder.mutation({
      query: ({ id, enabled }) => ({ url: `${PAYMENT_BASE}/coupons/${id}/${enabled ? "enable" : "disable"}`, method: "POST" }),
      invalidatesTags: (result, error, { id }) => [{ type: "AdminCoupon", id }, { type: "AdminCoupon", id: "LIST" }],
    }),

    getAdminCouponRedemptions: builder.query({
      query: ({ id, page = 0, size = 20 }) => ({ url: `${PAYMENT_BASE}/coupons/${id}/redemptions`, params: { page, size } }),
      providesTags: (result, error, { id }) => [{ type: "AdminCouponRedemption", id }],
    }),
  }),
});

export const {
  useGetSeriesListQuery,
  useDeleteSeriesMutation,
  useGetQuestionsListQuery,
  useDeleteQuestionMutation,
  useGetCategoriesListQuery,
  useDeleteCategoryMutation,
  useGetAuditLogsQuery,
  useGetAdminReviewsQuery,
  useGetAdminReviewStatsQuery,
  useModerateReviewMutation,
  useGetAdminPaymentsQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderDetailQuery,
  useGetAdminOrderTimelineQuery,
  useGetAdminRefundsQuery,
  useGetAdminRefundableAmountQuery,
  useRequestAdminRefundMutation,
  useGetAdminProductsQuery,
  useGetAdminEntitlementsQuery,
  useGrantAdminEntitlementMutation,
  useRevokeAdminEntitlementMutation,
  useGetAdminCouponsQuery,
  useCreateAdminCouponMutation,
  useUpdateAdminCouponMutation,
  useSetAdminCouponEnabledMutation,
  useGetAdminCouponRedemptionsQuery,
} = adminApi;
