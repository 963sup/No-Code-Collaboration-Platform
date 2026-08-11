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

import { signIn } from './actions';

export const metadata: Metadata = {
  title: 'Sign in'
};

const errorMessages = {
  'invalid-input': 'Enter a valid email address and a password with at least eight characters.',
  'invalid-credentials': 'The email or password could not be verified.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.'
} as const;

type SignInSearchParams = Promise<{
  error?: string;
  next?: string;
}>;

export default async function SignInPage({ searchParams }: { searchParams: SignInSearchParams }) {
  const parameters = await searchParams;
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const message = error ? errorMessages[error] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Authenticate as the actor before entering a Repository context.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signIn} className='space-y-5'>
          <input name='next' type='hidden' value={parameters.next ?? '/app'} />
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input autoComplete='email' id='email' name='email' required type='email' />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              autoComplete='current-password'
              id='password'
              minLength={8}
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
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
