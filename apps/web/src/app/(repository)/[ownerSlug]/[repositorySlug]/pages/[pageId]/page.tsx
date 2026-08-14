import { GetAccessiblePage } from '@no-code-collaboration-platform/application';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '@no-code-collaboration-platform/ui';
import { notFound } from 'next/navigation';

import { createRequestServices } from '@/composition/create-request-services';

import { requireAccessibleRepositoryRoute } from '../../_queries/get-accessible-repository-route';
import { updatePage } from '../actions';

interface RepositoryPageDetailProps {
  readonly params: Promise<{ ownerSlug: string; pageId: string; repositorySlug: string }>;
  readonly searchParams: Promise<{ error?: string; saved?: string }>;
}

const errorMessages: Readonly<Record<string, string>> = {
  forbidden: 'You do not have permission to update this Page.',
  'invalid-page': 'Check the Page title and content and try again.',
  'provider-unavailable': 'Page storage is temporarily unavailable.',
  'state-changed': 'The Page or its authority changed after loading. Refresh before saving again.'
};

export default async function RepositoryPageDetail({
  params,
  searchParams
}: RepositoryPageDetailProps) {
  const { ownerSlug, pageId, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const services = await createRequestServices();
  const page = await new GetAccessiblePage(services.pageReader).execute({
    pageId,
    repositoryId: route.repository.id
  });
  if (!page) notFound();

  const { error, saved } = await searchParams;

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Edit Page</h1>
        <p className='text-sm text-muted-foreground'>Edit this Page inside the current Repository.</p>
      </div>

      {saved === '1' ? (
        <p className='rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm'>
          Page saved.
        </p>
      ) : null}
      {error && errorMessages[error] ? (
        <p className='rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'>
          {errorMessages[error]}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{page.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePage} className='space-y-4'>
            <input name='expectedUpdatedAt' type='hidden' value={page.updatedAt} />
            <input name='ownerSlug' type='hidden' value={route.ownerSlug} />
            <input name='pageId' type='hidden' value={page.id} />
            <input name='repositoryId' type='hidden' value={route.repository.id} />
            <input name='repositorySlug' type='hidden' value={route.repository.slug} />
            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='page-title'>Title</label>
              <Input id='page-title' name='title' defaultValue={page.title} required />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='page-body'>Content</label>
              <Textarea id='page-body' name='body' defaultValue={page.content.body} rows={14} />
            </div>
            <Button type='submit'>Save Page</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
