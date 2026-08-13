'use server';

import { ResendEmailVerification, VerifyEmail } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { buildPath, resolvePostAuthDestination } from '@/auth/auth-navigation';
import { createRequestServices } from '@/composition/create-request-services';

const emailSchema = z.email().max(320);
const verificationSchema = z.object({
  code: z.string().regex(/^\d{6}$/u),
  email: emailSchema,
  next: z.string().optional()
});

function resolveEmailForRedirect(value: string) {
  const parsed = emailSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export async function verifyEmail(formData: FormData) {
  const next = resolvePostAuthDestination(String(formData.get('next') ?? ''));
  const email = String(formData.get('email') ?? '').trim();
  const parsed = verificationSchema.safeParse({
    code: String(formData.get('code') ?? '').trim(),
    email,
    next
  });

  if (!parsed.success) {
    redirect(
      buildPath('/verify-email', {
        email: resolveEmailForRedirect(email),
        error: 'invalid-input',
        next
      })
    );
  }

  const { identityProvider } = await createRequestServices();
  const result = await new VerifyEmail(identityProvider).execute({
    code: parsed.data.code,
    email: parsed.data.email,
    kind: 'code'
  });

  if (!result.ok) {
    redirect(
      buildPath('/verify-email', {
        email: parsed.data.email,
        error: result.reason,
        next
      })
    );
  }

  redirect(next);
}

export async function resendVerificationEmail(formData: FormData) {
  const next = resolvePostAuthDestination(String(formData.get('next') ?? ''));
  const parsed = emailSchema.safeParse(String(formData.get('email') ?? '').trim());

  if (!parsed.success) {
    redirect(buildPath('/verify-email', { error: 'invalid-input', next }));
  }

  const { identityProvider } = await createRequestServices();
  const result = await new ResendEmailVerification(identityProvider).execute(parsed.data);

  if (!result.ok) {
    redirect(
      buildPath('/verify-email', {
        email: parsed.data,
        error: result.reason,
        next
      })
    );
  }

  redirect(
    buildPath('/verify-email', {
      email: parsed.data,
      next,
      notice: 'resent'
    })
  );
}
