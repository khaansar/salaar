import { apiSlice } from "./apiSlice";

const PAYMENT_BASE = "/payments-api/admin";
const REVIEW_BASE = "/reviews-api/admin/reviews";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ------------------------------------------------------------
    // EXISTING ADMIN ENDPOINTS — PRESERVED
    // ------------------------------------------------------------

    getSeriesList: builder.query({
      query: (params) => ({
        url: "/tests-api/admin/series",
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Series", id })),
              { type: "Series", id: "LIST" },
            ]
          : [{ type: "Series", id: "LIST" }],
    }),

    deleteSeries: builder.mutation({
      query: (id) => ({
        url: `/tests-api/admin/series/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Series", id: "LIST" }],
    }),

    getQuestionsList: builder.query({
      query: (params) => ({
        url: "/tests-api/admin/questions",
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Question", id })),
              { type: "Question", id: "LIST" },
            ]
          : [{ type: "Question", id: "LIST" }],
    }),

    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/tests-api/admin/questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Question", id: "LIST" }],
    }),

    getCategoriesList: builder.query({
      query: (params) => ({
        url: "/tests-api/admin/categories",
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Category", id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/tests-api/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    getAuditLogs: builder.query({
      query: ({
        actorId,
        action,
        resourceType,
        service,
        from,
        to,
        page = 0,
        size = 20,
      } = {}) => ({
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
          ? [
              ...logs.map(({ eventId }) => ({
                type: "AuditLog",
                id: eventId,
              })),
              { type: "AuditLog", id: "LIST" },
            ]
          : [{ type: "AuditLog", id: "LIST" }];
      },
    }),

    // ------------------------------------------------------------
    // REVIEW MODERATION
    //
    // IMPORTANT:
    // Confirm REVIEW_BASE and the moderation request contract against
    // the actual review-service controller before using these routes.
    // ------------------------------------------------------------

    getAdminReviews: builder.query({
      query: ({
        status,
        targetType,
        rating,
        search,
        page = 0,
        size = 20,
      } = {}) => ({
        url: REVIEW_BASE,
        params: {
          status: status || undefined,
          targetType: targetType || undefined,
          rating: rating === "" || rating == null
            ? undefined
            : rating,
          search: search || undefined,
          page,
          size,
        },
      }),
      providesTags: (result) => {
        const reviews = Array.isArray(result)
          ? result
          : result?.content;

        return Array.isArray(reviews)
          ? [
              ...reviews.map((review) => ({
                type: "AdminReview",
                id: review.id,
              })),
              { type: "AdminReview", id: "LIST" },
            ]
          : [{ type: "AdminReview", id: "LIST" }];
      },
    }),

    getAdminReviewStats: builder.query({
      query: () => ({
        url: `${REVIEW_BASE}/stats`,
      }),
      providesTags: [{ type: "AdminReviewStats", id: "SUMMARY" }],
    }),

    moderateReview: builder.mutation({
      query: ({ reviewId, ...moderationRequest }) => ({
        url: `${REVIEW_BASE}/${reviewId}/moderate`,
        method: "PATCH",
        data: moderationRequest,
      }),
      invalidatesTags: [
        { type: "AdminReview", id: "LIST" },
        { type: "AdminReviewStats", id: "SUMMARY" },
      ],
    }),

    // ------------------------------------------------------------
    // PAYMENT MANAGEMENT — BAAHUBALI ADMIN APIs
    // ------------------------------------------------------------

    getAdminPayments: builder.query({
      query: ({
        orderId,
        userId,
        status,
        providerPaymentId,
        page = 0,
        size = 20,
      } = {}) => ({
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
          ? [
              ...payments.map(({ id }) => ({
                type: "AdminPayment",
                id,
              })),
              { type: "AdminPayment", id: "LIST" },
            ]
          : [{ type: "AdminPayment", id: "LIST" }];
      },
    }),

    getAdminOrders: builder.query({
      query: ({
        userId,
        status,
        orderNumber,
        page = 0,
        size = 20,
      } = {}) => ({
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
          ? [
              ...orders.map(({ id }) => ({
                type: "AdminOrder",
                id,
              })),
              { type: "AdminOrder", id: "LIST" },
            ]
          : [{ type: "AdminOrder", id: "LIST" }];
      },
    }),

    getAdminOrderDetail: builder.query({
      query: (orderId) => ({
        url: `${PAYMENT_BASE}/orders/${orderId}`,
      }),
      providesTags: (result, error, orderId) => [
        { type: "AdminOrder", id: orderId },
      ],
    }),

    getAdminOrderTimeline: builder.query({
      query: (orderId) => ({
        url: `${PAYMENT_BASE}/orders/${orderId}/timeline`,
      }),
      providesTags: (result, error, orderId) => [
        { type: "AdminOrderTimeline", id: orderId },
      ],
    }),

    getAdminRefunds: builder.query({
      query: ({
        orderId,
        status,
        page = 0,
        size = 20,
      } = {}) => ({
        url: `${PAYMENT_BASE}/refunds`,
        params: {
          orderId: orderId || undefined,
          status: status || undefined,
          page,
          size,
        },
      }),
      providesTags: (result) => {
        const refunds = result?.content;

        return Array.isArray(refunds)
          ? [
              ...refunds.map(({ id }) => ({
                type: "AdminRefund",
                id,
              })),
              { type: "AdminRefund", id: "LIST" },
            ]
          : [{ type: "AdminRefund", id: "LIST" }];
      },
    }),

    getAdminRefundableAmount: builder.query({
      query: (paymentId) => ({
        url: `${PAYMENT_BASE}/payments/${paymentId}/refundable`,
      }),
      providesTags: (result, error, paymentId) => [
        { type: "AdminRefundableAmount", id: paymentId },
      ],
    }),

    requestAdminRefund: builder.mutation({
      query: ({ paymentId, amount, reason, idempotencyKey }) => ({
        url: `${PAYMENT_BASE}/payments/${paymentId}/refunds`,
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        data: {
          amount,
          reason,
        },
      }),
      invalidatesTags: [
        { type: "AdminPayment", id: "LIST" },
        { type: "AdminOrder", id: "LIST" },
        { type: "AdminRefund", id: "LIST" },
        { type: "AdminRefundableAmount", id: "LIST" },
      ],
    }),
  }),
});

export const {
  // Existing admin hooks.
  useGetSeriesListQuery,
  useDeleteSeriesMutation,
  useGetQuestionsListQuery,
  useDeleteQuestionMutation,
  useGetCategoriesListQuery,
  useDeleteCategoryMutation,
  useGetAuditLogsQuery,

  // Review moderation hooks.
  useGetAdminReviewsQuery,
  useGetAdminReviewStatsQuery,
  useModerateReviewMutation,

  // Payment management hooks.
  useGetAdminPaymentsQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderDetailQuery,
  useGetAdminOrderTimelineQuery,
  useGetAdminRefundsQuery,
  useGetAdminRefundableAmountQuery,
  useRequestAdminRefundMutation,
} = adminApi;