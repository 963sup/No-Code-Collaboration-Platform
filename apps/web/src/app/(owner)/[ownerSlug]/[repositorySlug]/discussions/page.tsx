import { ListAccessibleDiscussions } from '@no-code-collaboration-platform/application';
import { Button, Input } from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ProjectionList } from '@/components/projection-list';
import { QueryControls } from '@/components/query-controls';
import { SurfaceFrame } from '@/components/surface-frame';
import { createRequestServices } from '@/composition/create-request-services';
import {
  canonicalSurfaceHref,
  normalizeSurfaceQuery,
  type SurfaceSearchParams
} from '@/routing/normalize-surface-query';
import { repositoryDiscussionPath, repositoryDiscussionsPath } from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';
import { createDiscussionAction } from './actions';

export const metadata: Metadata = { title: 'Repository discussions' };

export default async function RepositoryDiscussionsPage({
  params,
  searchParams
}: {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const address = await params;
  const route = await requireAccessibleRepositoryRoute(address.ownerSlug, address.repositorySlug);
  const pathname = repositoryDiscussionsPath(route);
  const normalized = normalizeSurfaceQuery(await searchParams, {
    q: { kind: 'text', maxLength: 200 },
    category: {
      kind: 'enum',
      values: ['all', 'general', 'question', 'announcement'],
      defaultValue: 'all'
    },
    status: { kind: 'enum', values: ['open', 'closed', 'all'], defaultValue: 'open' },
    sort: { kind: 'enum', values: ['updated', 'created'], defaultValue: 'updated' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref(pathname, normalized));
  const services = await createRequestServices();
  const collection = await new ListAccessibleDiscussions(services.discussionReader).execute({
    category: normalized.values.category,
    page: Number(normalized.values.page),
    query: normalized.values.q,
    repositoryId: route.repository.id,
    status: normalized.values.status
  });
  const createAction = createDiscussionAction.bind(null, address.ownerSlug, address.repositorySlug);
  return (
    <SurfaceFrame
      availability='live'
      controls={
        <div className='space-y-3'>
          <QueryControls
            action={pathname}
            controls={[
              {
                kind: 'text',
                name: 'q',
                label: 'Search',
                value: normalized.values.q,
                placeholder: 'Discussion title'
              },
              {
                kind: 'select',
                name: 'category',
                label: 'Category',
                value: normalized.values.category,
                options: [
                  { label: 'All', value: 'all' },
                  { label: 'General', value: 'general' },
                  { label: 'Questions', value: 'question' },
                  { label: 'Announcements', value: 'announcement' }
                ]
              },
              {
                kind: 'select',
                name: 'status',
                label: 'Status',
                value: normalized.values.status,
                options: [
                  { label: 'Open', value: 'open' },
                  { label: 'Closed', value: 'closed' },
                  { label: 'All', value: 'all' }
                ]
              },
              {
                kind: 'select',
                name: 'sort',
                label: 'Sort',
                value: normalized.values.sort,
                options: [
                  { label: 'Updated', value: 'updated' },
                  { label: 'Created', value: 'created' }
                ]
              }
            ]}
          />
          <details className='rounded-md border bg-card px-3 py-2'>
            <summary className='cursor-pointer text-sm font-semibold'>New Discussion</summary>
            <form action={createAction} className='mt-3 grid gap-3'>
              <Input maxLength={240} name='title' placeholder='Discussion title' required />
              <label className='grid gap-1 text-sm'>
                Category
                <select
                  className='h-9 rounded-md border bg-background px-3'
                  defaultValue='general'
                  name='category'
                >
                  <option value='general'>General</option>
                  <option value='question'>Question</option>
                  <option value='announcement'>Announcement (Maintain or Admin only)</option>
                </select>
              </label>
              <textarea
                className='min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm'
                name='body'
                placeholder='Opening context'
              />
              <Button className='justify-self-end' type='submit'>
                Create Discussion
              </Button>
            </form>
          </details>
        </div>
      }
      description='Repository-contained shared understanding with general, question, and announcement categories.'
      emptyTitle='No Discussions match this view'
      title={`Discussions${collection.total ? ` · ${collection.total}` : ''}`}
    >
      {collection.discussions.length ? (
        <ProjectionList
          items={collection.discussions.map((discussion) => ({
            href: repositoryDiscussionPath(route, discussion.discussionNumber),
            id: discussion.id,
            metadata: `${discussion.status}${discussion.isLocked ? ' · locked' : ''} · updated ${new Date(discussion.updatedAt).toLocaleDateString()}`,
            title: `#${discussion.discussionNumber} ${discussion.title}`,
            type: discussion.category
          }))}
        />
      ) : undefined}
    </SurfaceFrame>
  );
}
