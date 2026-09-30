'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchCurrentUser, clearAuth } from '../../store/slices/authSlice';

export default function AuthProvider({ children, hasSession = false }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    dispatch(fetchCurrentUser());
  }, [dispatch, hasSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(clearAuth());
    };

    window.addEventListener(
      'auth:session-expired',
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        'auth:session-expired',
        handleSessionExpired
      );
    };
  }, [dispatch]);

  return children;
}
