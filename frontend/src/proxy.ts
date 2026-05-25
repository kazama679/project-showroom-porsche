import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  // Excuding /api, /_next, /_vercel, and all static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (vercel specific)
     * - favicon.ico, sitemap.xml, robots.txt, etc. (static files)
     * - assets (images, fonts, etc assuming they are in public/assets or src/assets)
     */
    '/((?!api|_next/static|_next/image|_vercel|assets|favicon.ico|robots.txt|sitemap.xml|.*\\..*$).*)',
    // Match root path
    '/',
    // Match locales explicitly
    '/(vi|en)/:path*'
  ]
};
