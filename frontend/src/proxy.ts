import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    // Excuding /api, /_next, /_vercel, and all static files
    matcher: [
        // Exclude API routes, Next.js internals, and any static file (contains a dot)
        '/((?!api|_next|_vercel|.*\\..*$).*)',
        '/',
        '/(vi|en)/:path*'
    ]
};
