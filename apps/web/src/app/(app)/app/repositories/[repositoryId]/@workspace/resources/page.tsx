import { ListAccessiblePages } from '@no-code-collaboration-platform/application';
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
import Link from 'next/link';

import { createRequestServices } from '@/composition/create-request-services';

import { requireAccessibleRepository } from '../../_queries/get-accessible-repository';
import { createPage } from './actions';

interface RepositoryResourcesProps {
  readonly params: Promise<{ repositoryId: string }>;
  readonly searchParams: Promise<{ error?: string }>;
}

const errorMessages = {
  forbidden: 'Your current Repository authority does not allow Page creation.',
  'invalid-title': 'Enter a Page title between 1 and 240 characters.',
  'provider-unavailable': 'The Page could not be created. No change was reported as successful.'
} as const;

export default async function RepositoryResources({
  params,
  searchParams
}: RepositoryResourcesProps) {
  const [{ repositoryId }, parameters] = await Promise.all([params, searchParams]);
  const repository = await requireAccessibleRepository(repositoryId);
  const { pageReader } = await createRequestServices();
  const pages = await new ListAccessiblePages(pageReader).execute(repository.id);
  const error = parameters.error as keyof typeof errorMessages | undefined;
  const message = error ? errorMessages[error] : undefined;

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>
            Page is the first accepted Resource kind inside this Repository. Its identity,
            authority, transition, and history use the shared Repository boundary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPage} className='flex flex-col gap-3 sm:flex-row sm:items-end'>
            <input name='repositoryId' type='hidden' value={repository.id} />
            <div className='flex-1 space-y-2'>
              <Label htmlFor='page-title'>Page title</Label>
              <Input
                id='page-title'
                maxLength={240}
                name='title'
                placeholder='Product brief'
                required
              />
            </div>
            <Button type='submit'>Create Page</Button>
          </form>
          {message ? (
            <p aria-live='polite' className='mt-3 text-sm text-destructive' role='alert'>
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Repository Pages</CardTitle>
          <CardDescription>
            This list is loaded through the authorization-aware Application and RLS read path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No Pages have been created yet.</p>
          ) : (
            <ul className='divide-y rounded-md border'>
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    className='block px-4 py-3 transition-colors hover:bg-muted/50'
                    href={`/app/repositories/${repository.id}/resources/${page.id}`}
                  >
                    <span className='font-medium'>{page.title}</span>
                    <span className='mt-1 block text-xs text-muted-foreground'>
                      Updated{' '}
                      {new Date(page.updatedAt).toLocaleString('en-US', { timeZone: 'UTC' })} UTC
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
