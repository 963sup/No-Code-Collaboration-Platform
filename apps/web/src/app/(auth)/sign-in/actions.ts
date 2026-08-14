'use server';

import { SignInWithPassword } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { buildPath, resolvePostAuthDestination } from '@/routing/auth-routes';

const signInSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(1).max(1024),
  next: z.string().optional()
});

export async function signIn(formData: FormData) {
  const next = resolvePostAuthDestination(String(formData.get('next') ?? ''));
  const parsed = signInSchema.safeParse({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    next
  });

  if (!parsed.success) {
    redirect(buildPath('/sign-in', { error: 'invalid-input', next }));
  }

  const { identityProvider } = await createRequestServices();
  const result = await new SignInWithPassword(identityProvider).execute({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (!result.ok) {
    if (result.reason === 'email-verification-required') {
      redirect(
        buildPath('/verify-email', {
          email: parsed.data.email,
          next
        })
      );
    }

    redirect(buildPath('/sign-in', { error: result.reason, next }));
  }

  redirect(next);
}
