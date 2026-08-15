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

import { createOrganization } from './actions';

export const metadata: Metadata = {
  title: 'Create an Organization'
};

const errorMessages: Readonly<Record<string, string>> = {
  forbidden: 'Your current Session cannot create this Organization.',
  'invalid-input': 'Check the Organization name and slug.',
  'provider-unavailable': 'Organization storage is temporarily unavailable. Try again.',
  'slug-taken': 'That Owner namespace is already in use.'
};

interface NewOrganizationPageProps {
  readonly searchParams: Promise<{ error?: string }>;
}

export default async function NewOrganizationPage({ searchParams }: NewOrganizationPageProps) {
  const { error } = await searchParams;

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>New governance scope</p>
        <h1 className='text-3xl font-semibold tracking-tight'>Create an Organization</h1>
        <p className='text-muted-foreground'>
          An Organization centralizes membership and administration and may own Repositories. It is
          not itself a collaboration container.
        </p>
      </div>

      {error && errorMessages[error] ? (
        <p
          aria-live='polite'
          className='rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'
          role='alert'
        >
          {errorMessages[error]}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Organization details</CardTitle>
          <CardDescription>
            You become its first owner. Membership alone will not grant access to its Repositories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createOrganization} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='organization-name'>Organization name</Label>
              <Input
                autoComplete='organization'
                id='organization-name'
                maxLength={120}
                name='name'
                placeholder='Operations Group'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='organization-slug'>Organization slug</Label>
              <Input
                aria-describedby='organization-slug-help'
                autoCapitalize='none'
                autoComplete='off'
                id='organization-slug'
                maxLength={64}
                minLength={2}
                name='slug'
                pattern='[a-z0-9]+(?:-[a-z0-9]+)*'
                placeholder='operations-group'
                required
                spellCheck={false}
              />
              <p className='text-xs text-muted-foreground' id='organization-slug-help'>
                Lowercase letters, numbers, and single hyphens. User and Organization Owner slugs
                share one namespace.
              </p>
            </div>

            <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              <Link
                className='inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent'
                href='/dashboard'
              >
                Cancel
              </Link>
              <Button type='submit'>Create Organization</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
