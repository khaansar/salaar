import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;

  const accessToken = request.cookies.get('ACCESS_TOKEN')?.value;

  /*
   * Authentication pages are always reachable.
   *
   * We intentionally don't inspect user_role here because it
   * was a client-side convenience cookie and must not be treated
   * as an authorization source.
   */
  if (pathname === '/login' || pathname === '/signup') {
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

    return NextResponse.next();
  }

  /*
   * Student-only routes.
   */
  const studentRoutes = [
    '/attempts',
    '/attempt',
    '/bookmarks',
    '/performance',
    '/study-plan',
    '/categories',
    '/test-series',
    '/tests',
  ];

  const isStudentRoute = studentRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isStudentRoute && !accessToken) {
    const nextUrl = searchParams.get('next');

    const destination =
      nextUrl && nextUrl.startsWith('/')
        ? nextUrl
        : pathname;

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