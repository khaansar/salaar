'use client';
import { useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchCurrentUser } from '../../store/slices/authSlice';

export default function AuthProvider({ children }) {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token = getCookie('auth_token');
    
    if (token && !isInitialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isInitialized]);

  return <>{children}</>;
}