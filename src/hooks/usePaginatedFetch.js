'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-fetching hook for admin list pages backed by paginated
 * endpoints that return `{ items, meta }`.
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
      const parsedParams = JSON.parse(paramsKey);
      const result = await fetcher(parsedParams);
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
  }, [fetcher, paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, meta, loading, error, refetch };
}