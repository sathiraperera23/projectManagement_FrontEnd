import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/accept-invitation'];

export function middleware(request: NextRequest) {
  const authData = request.cookies.get('auth-storage')?.value;
  const isPublic = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route));
  if (!authData && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (authData && isPublic) {
    return NextResponse.redirect(new URL('/my-tickets', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
