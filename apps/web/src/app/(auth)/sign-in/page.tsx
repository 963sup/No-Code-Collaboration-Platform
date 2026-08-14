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

import { buildPath, resolvePostAuthDestination } from '@/routing/auth-routes';

import { signIn } from './actions';

export const metadata: Metadata = {
  title: 'Sign in'
};

const errorMessages = {
  'invalid-input': 'Enter a valid email address and password.',
  'invalid-credentials': 'The email or password could not be verified.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.'
} as const;

const noticeMessages = {
  'password-reset': 'Your password was updated. Sign in with your new password.'
} as const;

type SignInSearchParams = Promise<{
  error?: string;
  next?: string;
  notice?: string;
}>;

export default async function SignInPage({ searchParams }: { searchParams: SignInSearchParams }) {
  const parameters = await searchParams;
  const next = resolvePostAuthDestination(parameters.next);
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const notice = parameters.notice as keyof typeof noticeMessages | undefined;
  const message = error ? errorMessages[error] : undefined;
  const noticeMessage = notice ? noticeMessages[notice] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Sign in to access your organizations and repositories.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form action={signIn} className='space-y-5'>
          <input name='next' type='hidden' value={next} />
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
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-4'>
              <Label htmlFor='password'>Password</Label>
              <Link
                className='text-sm font-medium text-foreground underline-offset-4 hover:underline'
                href='/forgot-password'
              >
                Forgot password?
              </Link>
            </div>
            <Input
              autoComplete='current-password'
              id='password'
              maxLength={1024}
              name='password'
              required
              type='password'
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
            Sign in
          </Button>
        </form>
        <p className='text-center text-sm text-muted-foreground'>
          New to the platform?{' '}
          <Link
            className='font-medium text-foreground underline-offset-4 hover:underline'
            href={buildPath('/sign-up', { next })}
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
