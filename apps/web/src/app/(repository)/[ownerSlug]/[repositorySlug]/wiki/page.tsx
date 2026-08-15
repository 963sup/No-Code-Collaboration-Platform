import { ListAccessiblePages } from '@no-code-collaboration-platform/application';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input
} from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryWikiPagePath } from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';
import { createPage } from './actions';

interface RepositoryWikiProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
  readonly searchParams: Promise<{ error?: string }>;
}

const errorMessages: Readonly<Record<string, string>> = {
  forbidden: 'You do not have permission to create a Page in this Repository.',
  'invalid-page-input': 'Check the Page title and try again.',
  'invalid-title': 'Page title is required and must be 240 characters or fewer.',
  'provider-unavailable': 'Page storage is temporarily unavailable.'
};

export default async function RepositoryWiki({ params, searchParams }: RepositoryWikiProps) {
  const { ownerSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const services = await createRequestServices();
  const pages = await new ListAccessiblePages(services.pageReader).execute(route.repository.id);
  const { error } = await searchParams;

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Wiki</h1>
        <p className='text-sm text-muted-foreground'>Repository knowledge backed by Page resources.</p>
      </div>

      {error && errorMessages[error] ? (
        <p className='rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'>
          {errorMessages[error]}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Create a Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPage} className='flex flex-col gap-3 sm:flex-row'>
            <input name='ownerSlug' type='hidden' value={route.ownerSlug} />
            <input name='repositoryId' type='hidden' value={route.repository.id} />
            <input name='repositorySlug' type='hidden' value={route.repository.slug} />
            <Input aria-label='Page title' name='title' placeholder='Page title' required />
            <Button type='submit'>Create Page</Button>
          </form>
        </CardContent>
      </Card>

      {pages.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='py-8 text-sm text-muted-foreground'>
            No Pages are visible in this Repository yet.
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-3'>
          {pages.map((page) => (
            <Link key={page.id} href={repositoryWikiPagePath(route, page.id)}>
              <Card className='transition-colors hover:bg-accent/30'>
                <CardHeader>
                  <CardTitle className='text-base'>{page.title}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
