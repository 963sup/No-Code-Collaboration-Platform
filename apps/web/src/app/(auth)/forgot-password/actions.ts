'use server';

import { RequestPasswordRecovery } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { buildPath } from '@/auth/auth-navigation';
import { createRequestServices } from '@/composition/create-request-services';

const recoveryRequestSchema = z.object({
  email: z.email().max(320)
});

export async function requestPasswordRecovery(formData: FormData) {
  const parsed = recoveryRequestSchema.safeParse({
    email: String(formData.get('email') ?? '').trim()
  });

  if (!parsed.success) {
    redirect(buildPath('/forgot-password', { error: 'invalid-input' }));
  }

  const { identityProvider } = await createRequestServices();
  const result = await new RequestPasswordRecovery(identityProvider).execute(parsed.data.email);

  if (!result.ok) {
    redirect(buildPath('/forgot-password', { error: result.reason }));
  }

  redirect(buildPath('/forgot-password', { notice: 'sent' }));
}
