import { auth } from '../auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isPublicAsset = nextUrl.pathname.startsWith('/_next') || 
                       nextUrl.pathname.startsWith('/favicon') ||
                       nextUrl.pathname.startsWith('/public');

  // Laisser passer les routes API et assets publics
  if (isApiAuthRoute || isPublicAsset) {
    return null;
  }

  // Si pas connecté et pas sur page auth, rediriger vers signin
  if (!isLoggedIn && !isAuthPage && !isApiRoute) {
    return Response.redirect(new URL('/auth/signin', nextUrl));
  }

  // Si connecté et sur page auth, rediriger vers l'app principale
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};