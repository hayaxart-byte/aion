import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/forbidden', '/_next', '/favicon', '/api'];
const AUTH_ONLY_ROUTES = ['/onboarding'];

const ROUTE_ROLES: Record<string, string[]> = {
  '/dashboard': ['doctor', 'receptionist', 'nurse'],
  '/patients': ['doctor', 'receptionist', 'nurse'],
  '/appointments': ['doctor', 'receptionist', 'nurse'],
  '/encounters': ['doctor', 'receptionist', 'nurse'],
  '/calendar': ['doctor', 'receptionist', 'nurse'],
  '/profile': ['doctor', 'receptionist', 'nurse'],
  '/settings': ['doctor', 'receptionist', 'nurse'],
};

function getAllowedRoles(pathname: string): string[] | null {
  if (ROUTE_ROLES[pathname]) return ROUTE_ROLES[pathname];
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(route + '/')) return roles;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('aion_auth');
  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const allowed = getAllowedRoles(pathname);
  if (allowed) {
    const roleCookie = request.cookies.get('aion_role');
    const userRoles = roleCookie?.value?.split(',').filter(Boolean) ?? [];
    const hasAccess = userRoles.some((r) => allowed.includes(r));
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
