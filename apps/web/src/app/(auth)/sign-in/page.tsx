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

import { buildPath, resolvePostAuthDestination } from '@/auth/auth-navigation';

import { signIn } from './actions';

export const metadata: Metadata = {
  title: 'Sign in'
};

const errorMessages = {
  'invalid-input': 'Enter a valid email address and password.',
  'invalid-credentials': 'The email or password could not be verified.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.'
} as const;

type SignInSearchParams = Promise<{
  error?: string;
  next?: string;
}>;

export default async function SignInPage({ searchParams }: { searchParams: SignInSearchParams }) {
  const parameters = await searchParams;
  const next = resolvePostAuthDestination(parameters.next);
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const message = error ? errorMessages[error] : undefined;

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
            <Label htmlFor='password'>Password</Label>
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
