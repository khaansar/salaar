import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('ACCESS_TOKEN')?.value;
  const role = request.cookies.get('user_role')?.value;

  if (pathname === '/login' || pathname === '/signup') {
    if (token) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/admin-dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};