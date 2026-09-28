'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

export default function StoreProvider({ children, initialRole }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    const preloadedState = initialRole ? {
      auth: {
        user: { role: initialRole },
        status: 'idle',
        isInitialized: true,
        error: null,
      }
    } : undefined;
    storeRef.current = makeStore(preloadedState);
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
