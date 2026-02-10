import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/navigation';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|fr|es|de|it|ca)/:path*'],
};
