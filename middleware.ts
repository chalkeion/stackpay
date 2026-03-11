import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/send', '/stream', '/escrow', '/split', '/yield', '/invoice'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const connected = request.cookies.get('stackpay_connected')?.value === '1';

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  if (isProtected && !connected) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', '0');
    return NextResponse.redirect(url);
  }

  if (pathname === '/' && connected) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/send/:path*',
    '/stream/:path*',
    '/escrow/:path*',
    '/split/:path*',
    '/yield/:path*',
    '/invoice/:path*',
  ],
};
