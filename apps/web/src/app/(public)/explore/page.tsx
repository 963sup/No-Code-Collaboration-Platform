import { ExplorePublicRepositories } from '@no-code-collaboration-platform/application';
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

export const metadata: Metadata = { title: 'Explore' };

export default async function ExplorePage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    sort: { kind: 'enum', values: ['recent', 'new'], defaultValue: 'recent' },
    ownerType: { kind: 'enum', values: ['all', 'user', 'organization'], defaultValue: 'all' },
    artifact: { kind: 'enum', values: ['all', 'page', 'issue', 'discussion'], defaultValue: 'all' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/explore', normalized));
  const services = await createRequestServices();
  const page = await new ExplorePublicRepositories(services.exploreReader).execute({
    artifactType: normalized.values.artifact,
    ownerType: normalized.values.ownerType,
    page: Number(normalized.values.page),
    sort: normalized.values.sort
  });
  return (
    <main className='px-4 py-8 sm:px-6 lg:px-8'>
      <SurfaceFrame
        availability='live'
        controls={
          <QueryControls
            action='/explore'
            controls={[
              {
                kind: 'select',
                name: 'sort',
                label: 'Sort',
                value: normalized.values.sort,
                options: [
                  { label: 'Recent public activity', value: 'recent' },
                  { label: 'New Repositories', value: 'new' }
                ]
              },
              {
                kind: 'select',
                name: 'ownerType',
                label: 'Owner type',
                value: normalized.values.ownerType,
                options: [
                  { label: 'All owners', value: 'all' },
                  { label: 'Users', value: 'user' },
                  { label: 'Organizations', value: 'organization' }
                ]
              },
              {
                kind: 'select',
                name: 'artifact',
                label: 'Public Artifact',
                value: normalized.values.artifact,
                options: [
                  { label: 'Any', value: 'all' },
                  { label: 'Pages', value: 'page' },
                  { label: 'Issues', value: 'issue' },
                  { label: 'Discussions', value: 'discussion' }
                ]
              }
            ]}
          />
        }
        description='Public Repository discovery without personalization or private behavior inference. Private Repository existence, counts, and activity do not influence this projection.'
        emptyTitle='No public Repositories match this view'
        title={`Explore${page.total ? ` · ${page.total}` : ''}`}
      >
        {page.repositories.length ? (
          <ProjectionList
            items={page.repositories.map((repository) => ({
              description: repository.description ?? undefined,
              href: repository.href,
              id: repository.id,
              metadata: `${repository.ownerType} owner · activity ${new Date(repository.lastPublicActivityAt).toLocaleDateString()}`,
              title: `${repository.ownerSlug}/${repository.slug}`,
              type: 'repository'
            }))}
          />
        ) : undefined}
      </SurfaceFrame>
    </main>
  );
}
