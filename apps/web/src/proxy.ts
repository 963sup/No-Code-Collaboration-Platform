import type { NextRequest } from 'next/server';

import { refreshSession } from '@/composition/refresh-session';

export function proxy(request: NextRequest) {
  return refreshSession(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
