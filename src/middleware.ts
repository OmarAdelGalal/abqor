import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // In a real app, this would check a secure httpOnly cookie.
  // Since we are likely using localStorage for tokens in an SPA setup,
  // we can only do very basic middleware protection (e.g., checking if it's the root domain)
  // or we can skip middleware token validation and let the client-side handle it.
  
  const path = request.nextUrl.pathname;
  
  // Protect routes from unauthorized access
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/learning') || 
    path.startsWith('/notifications') ||
    path.startsWith('/account');

  // Next.js middleware cannot easily read localStorage. 
  // We'll let the client-side interceptors kick users out to /onboarding on 401.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
