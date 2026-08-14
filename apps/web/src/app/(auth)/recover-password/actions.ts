'use server';

import { VerifyPasswordRecovery } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { buildPath } from '@/routing/auth-routes';

const recoveryTokenSchema = z.string().min(1).max(2048);

export async function continuePasswordRecovery(formData: FormData) {
  const parsed = recoveryTokenSchema.safeParse(String(formData.get('tokenHash') ?? '').trim());

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
