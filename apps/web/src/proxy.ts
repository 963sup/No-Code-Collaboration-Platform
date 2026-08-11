import type { NextRequest } from 'next/server';

import { refreshSession } from '@/composition/refresh-session';

export function proxy(request: NextRequest) {
  return refreshSession(request);
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*', '/sign-in', '/sign-up', '/verify-email']
};
