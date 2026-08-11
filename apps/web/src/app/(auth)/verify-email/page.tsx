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

import {
  buildPath,
  resolvePostAuthDestination
} from '@/auth/auth-navigation';

import { resendVerificationEmail, verifyEmail } from './actions';

export const metadata: Metadata = {
  title: 'Verify email'
};

const errorMessages = {
  'expired-code': 'The verification code has expired. Request a new code.',
  'invalid-code': 'The verification code could not be verified.',
  'invalid-input': 'Enter a valid email address and six-digit verification code.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.',
  'rate-limited': 'Too many attempts were made. Try again later.'
} as const;

const noticeMessages = {
  resent: 'A new verification code was sent.',
  sent: 'A verification code was sent.'
} as const;

type VerifyEmailSearchParams = Promise<{
  email?: string;
  error?: string;
  next?: string;
  notice?: string;
}>;

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: VerifyEmailSearchParams;
}) {
  const parameters = await searchParams;
  const next = resolvePostAuthDestination(parameters.next);
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const notice = parameters.notice as keyof typeof noticeMessages | undefined;
  const errorMessage = error ? errorMessages[error] : undefined;
  const noticeMessage = notice ? noticeMessages[notice] : undefined;
  const email = parameters.email ?? '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the six-digit code sent to your email address to establish a verified session.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form action={verifyEmail} className='space-y-5'>
          <input name='next' type='hidden' value={next} />
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              autoComplete='email'
              defaultValue={email}
              id='email'
              maxLength={320}
              name='email'
              required
              type='email'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='code'>Verification code</Label>
            <Input
              autoComplete='one-time-code'
              id='code'
              inputMode='numeric'
              maxLength={6}
              minLength={6}
              name='code'
              pattern='[0-9]{6}'
              required
            />
          </div>
          {noticeMessage ? (
            <p aria-live='polite' className='text-sm text-muted-foreground'>
              {noticeMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p aria-live='polite' className='text-sm text-destructive' role='alert'>
              {errorMessage}
            </p>
          ) : null}
          <Button className='w-full' type='submit'>
            Verify email
          </Button>
        </form>
        {email ? (
          <form action={resendVerificationEmail}>
            <input name='email' type='hidden' value={email} />
            <input name='next' type='hidden' value={next} />
            <Button className='w-full' type='submit' variant='outline'>
              Resend code
            </Button>
          </form>
        ) : null}
        <p className='text-center text-sm text-muted-foreground'>
          Need to use another email?{' '}
          <Link
            className='font-medium text-foreground underline-offset-4 hover:underline'
            href={buildPath('/sign-up', { next })}
          >
            Create a different account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
