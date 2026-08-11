'use server';

import { redirect } from 'next/navigation';

import { createWebServerClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await createWebServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
