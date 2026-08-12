import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { buildPath } from '@/auth/auth-navigation';
import { PASSWORD_RECOVERY_TOKEN_COOKIE } from '@/auth/password-recovery-token';

import { continuePasswordRecovery } from './actions';

export const metadata: Metadata = {
  title: 'Continue password recovery'
};

export default async function RecoverPasswordPage() {
  const cookieStore = await cookies();

  if (!cookieStore.get(PASSWORD_RECOVERY_TOKEN_COOKIE)) {
    redirect(buildPath('/forgot-password', { error: 'invalid-recovery-session' }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue password recovery</CardTitle>
        <CardDescription>
          Continue only if you requested this password reset. The recovery proof is not consumed
          until you confirm below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={continuePasswordRecovery}>
          <Button className='w-full' type='submit'>
            Continue password reset
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
