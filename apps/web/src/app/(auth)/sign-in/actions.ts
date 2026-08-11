'use server';

import { SignInWithPassword } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  next: z.string().optional()
});

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/app';
  return value;
}

export async function signIn(formData: FormData) {
  const next = safeNextPath(String(formData.get('next') ?? ''));
  const parsed = signInSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    next
  });

  if (!parsed.success) {
    redirect(`/sign-in?error=invalid-input&next=${encodeURIComponent(next)}`);
  }

  const { identityProvider } = await createRequestServices();
  const result = await new SignInWithPassword(identityProvider).execute({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (!result.ok) {
    redirect(`/sign-in?error=${result.reason}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
