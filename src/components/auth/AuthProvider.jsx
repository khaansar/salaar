'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchCurrentUser, setRoleFromCookie } from '../../store/slices/authSlice';

export default function AuthProvider({ children, initialRole }) {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);
  const isFirstRender = useRef(true);

  if (isFirstRender.current) {
    if (initialRole && !isInitialized) {
      dispatch(setRoleFromCookie(initialRole));
    }
    isFirstRender.current = false;
  }

  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isInitialized]);

  return children;
}