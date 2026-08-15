import {
  ListRepositoryCreationOwners,
  RepositoryCreationAccessPolicy,
  type RepositoryCreationOwner
} from '@no-code-collaboration-platform/application';
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

import { createRequestServices } from '@/composition/create-request-services';

import { createRepository } from './actions';

export const metadata: Metadata = {
  title: 'Create a Repository'
};

const errorMessages: Readonly<Record<string, string>> = {
  forbidden: 'You no longer have permission to create a Repository for that owner.',
  'invalid-input': 'Check the Repository name, slug, owner, and visibility.',
  'provider-unavailable': 'Repository storage is temporarily unavailable. Try again.',
  'slug-taken': 'That owner already has a Repository with this slug.'
};

interface NewRepositoryPageProps {
  readonly searchParams: Promise<{ error?: string; notice?: string; owner?: string }>;
}

function ownerValue(owner: RepositoryCreationOwner) {
  return owner.owner.kind === 'user'
    ? `user:${owner.owner.userId}`
    : `organization:${owner.owner.organizationId}`;
}

export default async function NewRepositoryPage({ searchParams }: NewRepositoryPageProps) {
  const services = await createRequestServices();
  const accessPolicy = new RepositoryCreationAccessPolicy(services.repositoryCreationAccessReader);
  const owners = await new ListRepositoryCreationOwners(
    services.identityProvider,
    accessPolicy
  ).execute();
  const { error, notice, owner: requestedOwner } = await searchParams;
  const defaultOwner =
    owners.find((candidate) => ownerValue(candidate) === requestedOwner) ?? owners[0];

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>New collaboration container</p>
        <h1 className='text-3xl font-semibold tracking-tight'>Create a Repository</h1>
        <p className='text-muted-foreground'>
          A Repository gives collaborative work one stable owner, URL, and authorization boundary.
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

      {notice === 'organization-created' ? (
        <p
          aria-live='polite'
          className='rounded-md border border-border bg-muted/50 p-3 text-sm text-foreground'
          role='status'
        >
          Organization created. It is selected as this Repository&apos;s Owner.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Repository details</CardTitle>
          <CardDescription>
            Choose your personal namespace or an Organization where you are an admin or owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!defaultOwner ? (
            <div className='space-y-4 text-sm text-muted-foreground'>
              <p>No eligible owner namespace is available for Repository creation.</p>
              <Link className='font-medium text-foreground hover:underline' href='/dashboard'>
                Return to repositories
              </Link>
            </div>
          ) : (
            <form action={createRepository} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='repository-owner'>Owner</Label>
                <select
                  className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  defaultValue={ownerValue(defaultOwner)}
                  id='repository-owner'
                  name='owner'
                  required
                >
                  {owners.map((owner) => (
                    <option key={ownerValue(owner)} value={ownerValue(owner)}>
                      {owner.name} ({owner.slug})
                      {owner.owner.kind === 'user' ? ' — personal' : ' — Organization'}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='repository-name'>Repository name</Label>
                <Input
                  autoComplete='off'
                  id='repository-name'
                  maxLength={160}
                  name='name'
                  placeholder='Customer workspace'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='repository-slug'>Repository slug</Label>
                <Input
                  aria-describedby='repository-slug-help'
                  autoCapitalize='none'
                  autoComplete='off'
                  id='repository-slug'
                  maxLength={64}
                  minLength={2}
                  name='slug'
                  pattern='[a-z0-9]+(?:-[a-z0-9]+)*'
                  placeholder='customer-workspace'
                  required
                  spellCheck={false}
                />
                <p className='text-xs text-muted-foreground' id='repository-slug-help'>
                  Lowercase letters, numbers, and single hyphens. This becomes part of the canonical
                  URL.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='repository-description'>Description (optional)</Label>
                <textarea
                  className='min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
                  id='repository-description'
                  name='description'
                  placeholder='What will collaborators accomplish here?'
                  rows={4}
                />
              </div>

              <fieldset className='space-y-3'>
                <legend className='text-sm font-medium'>Visibility</legend>
                <label className='flex cursor-pointer gap-3 rounded-md border p-3'>
                  <input defaultChecked name='visibility' type='radio' value='private' />
                  <span>
                    <span className='block text-sm font-medium'>Private</span>
                    <span className='block text-xs text-muted-foreground'>
                      Only explicitly authorized collaborators can read it.
                    </span>
                  </span>
                </label>
                <label className='flex cursor-pointer gap-3 rounded-md border p-3'>
                  <input name='visibility' type='radio' value='public' />
                  <span>
                    <span className='block text-sm font-medium'>Public</span>
                    <span className='block text-xs text-muted-foreground'>
                      Anyone may read it; changes still require authority.
                    </span>
                  </span>
                </label>
              </fieldset>

              <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                <Link
                  className='inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent'
                  href='/dashboard'
                >
                  Cancel
                </Link>
                <Button type='submit'>Create Repository</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
