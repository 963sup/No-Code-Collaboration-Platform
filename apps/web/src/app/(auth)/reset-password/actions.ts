'use server';

import { ResetPassword, SignOut } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { buildPath } from '@/routing/auth-routes';

const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(8).max(1024),
    password: z.string().min(8).max(1024)
  })
  .refine(({ confirmPassword, password }) => confirmPassword === password, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.'
  });

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
    password: String(formData.get('password') ?? '')
  });

  if (!parsed.success) {
    redirect(buildPath('/reset-password', { error: 'invalid-input' }));
  }

  const { identityProvider } = await createRequestServices();
  const result = await new ResetPassword(identityProvider).execute(parsed.data.password);

  if (!result.ok) {
    if (result.reason === 'invalid-recovery-session') {
      redirect(buildPath('/forgot-password', { error: result.reason }));
    }

    redirect(buildPath('/reset-password', { error: result.reason }));
  }

  try {
    await new SignOut(identityProvider).execute('current-session');
  } catch {
    // Recovery sessions never count as ordinary product identity, so a stale recovery cookie
    // cannot authorize /app. A fresh password sign-in replaces it on the next successful login.
  }

  redirect(buildPath('/sign-in', { notice: 'password-reset' }));
}
