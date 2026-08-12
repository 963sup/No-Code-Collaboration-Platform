'use server';

import { VerifyPasswordRecovery } from '@no-code-collaboration-platform/application';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { buildPath } from '@/auth/auth-navigation';
import { PASSWORD_RECOVERY_TOKEN_COOKIE } from '@/auth/password-recovery-token';
import { createRequestServices } from '@/composition/create-request-services';

const recoveryTokenSchema = z.string().min(1).max(2048);

export async function continuePasswordRecovery() {
  const cookieStore = await cookies();
  const parsed = recoveryTokenSchema.safeParse(
    cookieStore.get(PASSWORD_RECOVERY_TOKEN_COOKIE)?.value ?? ''
  );

  cookieStore.delete(PASSWORD_RECOVERY_TOKEN_COOKIE);

  if (!parsed.success) {
    redirect(buildPath('/auth/error', { reason: 'invalid-code' }));
  }

  const { identityProvider } = await createRequestServices();
  const result = await new VerifyPasswordRecovery(identityProvider).execute(parsed.data);

  if (!result.ok) {
    redirect(buildPath('/auth/error', { reason: result.reason }));
  }

  redirect('/reset-password');
}
