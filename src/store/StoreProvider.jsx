'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';
import { initialAuthState } from './slices/authSlice';

export default function StoreProvider({ children, hasSession = false }) {
  const [store] = useState(() =>
    makeStore({
      auth: {
        ...initialAuthState,
        // A missing HttpOnly session cookie is definitive, so public pages
        // can render immediately without a client-side session request.
        isInitialized: !hasSession,
      },
    })
  );

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
