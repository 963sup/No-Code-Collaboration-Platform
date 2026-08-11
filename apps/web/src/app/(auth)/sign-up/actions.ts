'use server';

import { RegisterWithPassword } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { buildPath, resolvePostAuthDestination } from '@/auth/auth-navigation';
import { createRequestServices } from '@/composition/create-request-services';

const signUpSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(8).max(1024),
  next: z.string().optional()
});

export async function signUp(formData: FormData) {
  const next = resolvePostAuthDestination(String(formData.get('next') ?? ''));
  const parsed = signUpSchema.safeParse({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    next
  });

  if (!parsed.success) {
    redirect(buildPath('/sign-up', { error: 'invalid-input', next }));
  }

  const { identityProvider } = await createRequestServices();
  const result = await new RegisterWithPassword(identityProvider).execute({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (!result.ok) {
    redirect(buildPath('/sign-up', { error: result.reason, next }));
  }

  if (result.status === 'authenticated') redirect(next);

  redirect(
    buildPath('/verify-email', {
      email: parsed.data.email,
      next,
      notice: 'sent'
    })
  );
}
