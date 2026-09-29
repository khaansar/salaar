'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchCurrentUser, clearAuth } from '../../store/slices/authSlice';

export default function AuthProvider({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

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