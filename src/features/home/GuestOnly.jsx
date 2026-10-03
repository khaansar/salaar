'use client';

import { useAppSelector } from '../../hooks/useAppSelector';

export default function GuestOnly({ children }) {
  const { user } = useAppSelector((state) => state.auth);
  return user ? null : children;
}