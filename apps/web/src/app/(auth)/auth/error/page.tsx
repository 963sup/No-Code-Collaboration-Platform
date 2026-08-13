import {
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn
} from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { buildPath, resolvePostAuthDestination } from '@/auth/auth-navigation';

export const metadata: Metadata = {
  title: 'Authentication error'
};

const errorMessages = {
  'expired-code': 'The authentication link has expired.',
  'invalid-code': 'The authentication link could not be verified.',
  'provider-unavailable': 'The identity service is temporarily unavailable.',
  'rate-limited': 'Too many authentication attempts were made.'
} as const;

const fallbackMessage = 'The authentication request could not be completed.';

type AuthErrorSearchParams = Promise<{
  next?: string;
  reason?: string;
}>;

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams: AuthErrorSearchParams;
}) {
  const parameters = await searchParams;
  const next = resolvePostAuthDestination(parameters.next);
  const reason = parameters.reason as keyof typeof errorMessages | undefined;
  const message = reason ? (errorMessages[reason] ?? fallbackMessage) : fallbackMessage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication could not be completed</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link className={cn(buttonVariants(), 'w-full')} href={buildPath('/sign-in', { next })}>
          Return to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
