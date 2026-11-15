import { NextResponse } from 'next/server';
import { safeNextPath } from './utils/redirect';

/*
 * Reads the role claim from the access token without verifying its signature.
 * This only decides which page to show; every admin API call is still
 * authorized by the backend, so a forged token gains nothing.
 */
function readTokenRole(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))?.role ?? null;
  } catch {
    return null;
  }
}

/*
 * The same-site page the request came from (the Referer header), or the home
 * page when there is none or it would lead straight back here or to auth.
 */
function previousPagePath(request) {
  const referer = request.headers.get('referer');

  try {
    const previous = new URL(referer);
    const path = `${previous.pathname}${previous.search}`;

    if (
      previous.origin !== request.nextUrl.origin ||
      previous.pathname.startsWith('/admin-dashboard') ||
      previous.pathname === '/login' ||
      previous.pathname === '/signup'
    ) {
      return '/';
    }

    return safeNextPath(path, '/');
  } catch {
    return '/';
  }
}

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;

  const accessToken = request.cookies.get('ACCESS_TOKEN')?.value;

  /*
   * Authentication pages are always reachable.
   */
  /*
 * Redirect authenticated visitors away from login and signup.
 */
    if (pathname === '/login' || pathname === '/signup') {
        if (accessToken) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    }

  /*
   * Admin routes.
   *
   * We only perform an inexpensive session-presence check here.
   * Actual ADMIN authorization is performed by the backend.
   */
  if (pathname.startsWith('/admin-dashboard')) {
    if (!accessToken) {
      return NextResponse.redirect(
        new URL(
          `/login?next=${encodeURIComponent(pathname)}`,
          request.url
        )
      );
    }

    // Signed-in non-admins go back to the page they came from.
    if (readTokenRole(accessToken) !== 'ADMIN') {
      return NextResponse.redirect(
        new URL(previousPagePath(request), request.url)
      );
    }

    return NextResponse.next();
  }

  /*
   * Student-only routes.
   */
  const studentRoutes = [
    '/attempts',
    '/attempt',
    '/categories',
    '/profile',
    '/settings',
  ];

  const isStudentRoute = studentRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isStudentRoute && !accessToken) {
    const nextUrl = searchParams.get('next');

    const destination = safeNextPath(nextUrl, pathname);

    return NextResponse.redirect(
      new URL(
        `/login?next=${encodeURIComponent(destination)}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|images).*)',
  ],
};