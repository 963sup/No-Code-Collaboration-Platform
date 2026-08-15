import { SearchCollaboration } from '@no-code-collaboration-platform/application';
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

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    q: { kind: 'text', maxLength: 200 },
    type: {
      kind: 'enum',
      values: ['all', 'repository', 'page', 'issue', 'discussion', 'project'],
      defaultValue: 'all'
    },
    owner: { kind: 'text', maxLength: 64 },
    repository: { kind: 'text', maxLength: 64 },
    status: { kind: 'enum', values: ['all', 'open', 'closed'], defaultValue: 'all' },
    sort: {
      kind: 'enum',
      values: ['relevance', 'updated', 'created'],
      defaultValue: 'relevance'
    },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/search', normalized));
  const services = await createRequestServices();
  const page = await new SearchCollaboration(services.collaborationSearchReader).execute({
    owner: normalized.values.owner,
    page: Number(normalized.values.page),
    query: normalized.values.q,
    repository: normalized.values.repository,
    sort: normalized.values.sort,
    status: normalized.values.status,
    type: normalized.values.type
  });
  const controls = (
    <QueryControls
      action='/search'
      controls={[
        {
          kind: 'text',
          name: 'q',
          label: 'Search',
          value: normalized.values.q,
          placeholder: 'Repository, Page, Issue, or Discussion'
        },
        {
          kind: 'select',
          name: 'type',
          label: 'Type',
          value: normalized.values.type,
          options: [
            { label: 'All no-code content', value: 'all' },
            { label: 'Repositories', value: 'repository' },
            { label: 'Pages', value: 'page' },
            { label: 'Issues', value: 'issue' },
            { label: 'Discussions', value: 'discussion' },
            { label: 'Planning views', value: 'project' }
          ]
        },
        {
          kind: 'text',
          name: 'owner',
          label: 'Owner',
          value: normalized.values.owner,
          placeholder: 'Owner slug'
        },
        {
          kind: 'select',
          name: 'sort',
          label: 'Sort',
          value: normalized.values.sort,
          options: [
            { label: 'Relevance', value: 'relevance' },
            { label: 'Updated', value: 'updated' },
            { label: 'Created', value: 'created' }
          ]
        }
      ]}
    />
  );
  return (
    <main className='px-4 py-8 sm:px-6 lg:px-8'>
      <SurfaceFrame
        availability='live'
        controls={controls}
        description='Search only authorized Repository metadata, Pages, Issues, Discussions, and derived planning views. Authorization is applied before ranking, count, and snippet generation.'
        emptyDescription={
          normalized.values.q
            ? 'No authorized results match the query.'
            : 'Enter a query. An empty query never lists all data.'
        }
        emptyTitle={normalized.values.q ? 'No search results' : 'Search no-code collaboration'}
        title={`Search${page.total ? ` · ${page.total}` : ''}`}
      >
        {page.results.length ? (
          <ProjectionList
            items={page.results.map((result) => ({
              description: result.bodySnippet,
              href: result.href,
              id: result.id,
              metadata: `Updated ${new Date(result.updatedAt).toLocaleDateString()}`,
              title: result.title,
              type: result.type
            }))}
          />
        ) : undefined}
      </SurfaceFrame>
    </main>
  );
}
