'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-fetching hook for admin list pages backed by paginated
 * endpoints that return `{ items, meta }` (see `adminService.js`).
 *
 * @param {(params: object) => Promise<{items: any[], meta: any}>} fetcher
 * @param {object} params - filters/page/limit, re-fetches whenever this changes
 */
export function usePaginatedFetch(fetcher, params) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const paramsKey = JSON.stringify(params);

  const refetch = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(params);
      if (currentRequest !== requestId.current) return;
      setItems(result.items);
      setMeta(result.meta);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(err?.message || 'Failed to load data');
      setItems([]);
      setMeta(null);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, meta, loading, error, refetch };
}