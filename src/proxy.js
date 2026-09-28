import { NextResponse } from 'next/server';

export async function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  
  const token = request.cookies.get('ACCESS_TOKEN')?.value;
  const role = request.cookies.get('user_role')?.value;

  // 1. Auth pages (login, signup)
  if (pathname === '/login' || pathname === '/signup') {
    if (token) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      }
      
      const nextUrl = searchParams.get('next');
      if (nextUrl && nextUrl.startsWith('/')) {
        return NextResponse.redirect(new URL(nextUrl, request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin routes
  if (pathname.startsWith('/admin-dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 3. Student-only routes (including viewing categories and tests)
  const studentRoutes = ['/attempts', '/attempt', '/bookmarks', '/performance', '/study-plan', '/categories', '/test-series', '/tests'];
  const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route));
  
  if (isStudentRoute) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
    }
    return NextResponse.next();
  }

  // 4. Public routes (/, /test-series, /tests, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|images).*)'],
};
