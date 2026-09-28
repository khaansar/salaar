'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

export default function StoreProvider({ children, initialRole }) {
  const [store] = useState(() => {
    const preloadedState = initialRole ? {
      auth: {
        user: { role: initialRole },
        status: 'idle',
        isInitialized: true,
        error: null,
      }
    } : undefined;
    return makeStore(preloadedState);
  });

  return <Provider store={store}>{children}</Provider>;
}
