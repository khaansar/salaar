'use client';

import { useGetAllMyEntitlementsQuery } from '../../store/paymentApi';

export function useMyEntitlements({ enabled = true } = {}) {
  const query = useGetAllMyEntitlementsQuery(undefined, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });

  return {
    entitlements: Array.isArray(query.data) ? query.data : [],
    isLoading: enabled && query.isLoading,
    isFetching: enabled && query.isFetching,
    isError: enabled && query.isError,
    refetch: query.refetch,
  };
}
