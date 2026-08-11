'use server';

import { SignOut } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';

import { createRequestServices } from '@/composition/create-request-services';

export async function signOut() {
  const { identityProvider } = await createRequestServices();
  await new SignOut(identityProvider).execute('current-session');
  redirect('/');
}
