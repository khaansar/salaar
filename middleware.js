import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/student') || pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Here ideally we would decode the JWT to check role.
    // However, since we don't have a jwt decode lib, and this is just middleware routing,
    // if a student tries to access admin or vice versa, we'd need their role.
    // We can't strictly enforce role check here without decoding token, 
    // but the API backend will reject invalid role requests.
    // If we wanted to, we could store `user_role` in a separate cookie during login.
    // For now, we just enforce authentication.
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (token) {
      // We don't know the exact role here without decoding, redirect to a default 
      // or check a role cookie if one exists. Let's redirect to /student as default 
      // and they can navigate or be redirected by a layout.
      // A better approach is storing `user_role` in a cookie in authSlice.
      const role = request.cookies.get('user_role')?.value;
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/login', '/signup'],
};
