import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le token depuis les cookies ou localStorage (côté client)
  const token = request.cookies.get('auth_token')?.value;
  
  // Routes protégées
  const protectedRoutes = [
    '/dashboard',
    '/reservations',
    '/rooms',
    '/profile',
    '/admin',
  ];
  
  // Routes admin uniquement
  const adminRoutes = [
    '/admin',
  ];
  
  // Routes publiques
  const publicRoutes = [
    '/login',
    '/',
  ];
  
  const { pathname } = request.nextUrl;
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Si pas de token et route protégée, rediriger vers login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Si token et sur page de login, rediriger vers dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirection de la racine vers dashboard si connecté, sinon vers login
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};