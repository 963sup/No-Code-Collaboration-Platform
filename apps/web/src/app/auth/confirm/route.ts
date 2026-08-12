import {
  VerifyEmail,
  VerifyPasswordRecovery
} from '@no-code-collaboration-platform/application';
import { type NextRequest, NextResponse } from 'next/server';

import { buildPath, resolvePostAuthDestination } from '@/auth/auth-navigation';
import { createRequestServices } from '@/composition/create-request-services';

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const next = resolvePostAuthDestination(request.nextUrl.searchParams.get('next'));

  if (!tokenHash) {
    return NextResponse.redirect(
      new URL(buildPath('/auth/error', { next, reason: 'invalid-code' }), request.url)
    );
  }

  const { identityProvider } = await createRequestServices();

  if (type === 'recovery') {
    const result = await new VerifyPasswordRecovery(identityProvider).execute(tokenHash);

    if (!result.ok) {
      return NextResponse.redirect(
        new URL(buildPath('/auth/error', { reason: result.reason }), request.url)
      );
    }

    return NextResponse.redirect(new URL('/reset-password', request.url));
  }

  if (type !== 'email') {
    return NextResponse.redirect(
      new URL(buildPath('/auth/error', { next, reason: 'invalid-code' }), request.url)
    );
  }

  const result = await new VerifyEmail(identityProvider).execute({
    kind: 'token-hash',
    tokenHash
  });

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(buildPath('/auth/error', { next, reason: result.reason }), request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
