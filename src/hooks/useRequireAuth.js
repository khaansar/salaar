'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from './useAppSelector';

/**
 * A hook that returns a wrapper function to protect client-side actions.
 * If the user is authenticated, it executes the provided callback.
 * If not, it redirects to the login page with a `next` parameter pointing to the current path.
 */
export function useRequireAuth() {
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = (callback) => {
    return (...args) => {
      if (!isAuthenticated) {
        // Encode the current pathname so we can return here after login
        const nextUrl = encodeURIComponent(pathname);
        router.push(`/login?next=${nextUrl}`);
        return;
      }
      
      // User is authenticated, proceed with the action
      return callback(...args);
    };
  };

  return requireAuth;
}
