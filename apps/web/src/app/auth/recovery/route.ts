import { type NextRequest, NextResponse } from 'next/server';

import {
  PASSWORD_RECOVERY_TOKEN_COOKIE,
  PASSWORD_RECOVERY_TOKEN_MAX_AGE_SECONDS,
  PASSWORD_RECOVERY_TOKEN_PATH
} from '@/auth/password-recovery-token';

const MAX_TOKEN_HASH_LENGTH = 2048;

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')?.trim();

  if (!tokenHash || tokenHash.length > MAX_TOKEN_HASH_LENGTH) {
    return NextResponse.redirect(new URL('/auth/error?reason=invalid-code', request.url));
  }

  const response = NextResponse.redirect(new URL(PASSWORD_RECOVERY_TOKEN_PATH, request.url));
  response.cookies.set({
    httpOnly: true,
    maxAge: PASSWORD_RECOVERY_TOKEN_MAX_AGE_SECONDS,
    name: PASSWORD_RECOVERY_TOKEN_COOKIE,
    path: PASSWORD_RECOVERY_TOKEN_PATH,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    value: tokenHash
  });
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');

  return response;
}
