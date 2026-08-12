import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { requestPasswordRecovery } from './actions';

export const metadata: Metadata = {
  title: 'Reset password'
};

const errorMessages = {
  'invalid-input': 'Enter a valid email address.',
  'invalid-recovery-session': 'Request a new password reset link to continue.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.'
} as const;

const noticeMessages = {
  sent: "If an account can be recovered with that email, we've sent password reset instructions."
} as const;

type ForgotPasswordSearchParams = Promise<{
  error?: string;
  notice?: string;
}>;

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: ForgotPasswordSearchParams;
}) {
  const parameters = await searchParams;
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const notice = parameters.notice as keyof typeof noticeMessages | undefined;
  const message = error ? errorMessages[error] : undefined;
  const noticeMessage = notice ? noticeMessages[notice] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email address. Recovery requests do not reveal whether an account exists.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form action={requestPasswordRecovery} className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              autoComplete='email'
              id='email'
              maxLength={320}
              name='email'
              required
              type='email'
            />
          </div>
          {message ? (
            <p aria-live='polite' className='text-sm text-destructive' role='alert'>
              {message}
            </p>
          ) : null}
          {noticeMessage ? (
            <p aria-live='polite' className='text-sm text-muted-foreground' role='status'>
              {noticeMessage}
            </p>
          ) : null}
          <Button className='w-full' type='submit'>
            Send reset instructions
          </Button>
        </form>
        <p className='text-center text-sm text-muted-foreground'>
          <Link
            className='font-medium text-foreground underline-offset-4 hover:underline'
            href='/sign-in'
          >
            Return to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
