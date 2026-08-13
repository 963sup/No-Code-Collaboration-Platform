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

import { resetPassword } from './actions';

export const metadata: Metadata = {
  title: 'Choose a new password'
};

const errorMessages = {
  'invalid-input': 'Use at least eight characters and enter the same password twice.',
  'provider-unavailable': 'The identity service is temporarily unavailable. Try again.',
  'same-password': 'Choose a password that is different from your current password.',
  'weak-password': 'Choose a stronger password with at least eight characters.'
} as const;

type ResetPasswordSearchParams = Promise<{
  error?: string;
}>;

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: ResetPasswordSearchParams;
}) {
  const parameters = await searchParams;
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const message = error ? errorMessages[error] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          This page is available only after a valid password recovery proof.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={resetPassword} className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='password'>New password</Label>
            <Input
              autoComplete='new-password'
              id='password'
              maxLength={1024}
              minLength={8}
              name='password'
              required
              type='password'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm new password</Label>
            <Input
              autoComplete='new-password'
              id='confirmPassword'
              maxLength={1024}
              minLength={8}
              name='confirmPassword'
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
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
