'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createWebServerClient } from '@/lib/supabase/server';

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

  const supabase = await createWebServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    redirect(`/sign-in?error=invalid-credentials&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
