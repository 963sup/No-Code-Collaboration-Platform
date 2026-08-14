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

import { signUp } from './actions';

export const metadata: Metadata = {
  title: 'Create account'
};

const errorMessages = {
  'invalid-input': 'Enter a valid email address and a password with at least eight characters.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.',
  'rate-limited': 'Too many attempts were made. Try again later.',
  'registration-disabled': 'Account registration is not available.',
  'weak-password': 'Choose a stronger password with at least eight characters.'
} as const;

type SignUpSearchParams = Promise<{
  error?: string;
  next?: string;
}>;

export default async function SignUpPage({ searchParams }: { searchParams: SignUpSearchParams }) {
  const parameters = await searchParams;
  const next = resolvePostAuthDestination(parameters.next);
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const message = error ? errorMessages[error] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Create an identity first. Organization and Repository access are granted separately.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form action={signUp} className='space-y-5'>
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
              autoComplete='new-password'
              id='password'
              maxLength={1024}
              minLength={8}
              name='password'
              required
              type='password'
            />
            <p className='text-xs text-muted-foreground'>Use at least eight characters.</p>
          </div>
          {message ? (
            <p aria-live='polite' className='text-sm text-destructive' role='alert'>
              {message}
            </p>
          ) : null}
          <Button className='w-full' type='submit'>
            Create account
          </Button>
        </form>
        <p className='text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            className='font-medium text-foreground underline-offset-4 hover:underline'
            href={buildPath('/sign-in', { next })}
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
