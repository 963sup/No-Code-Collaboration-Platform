import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { QueryControls } from '@/components/query-controls';
import { SurfaceFrame } from '@/components/surface-frame';
import {
  canonicalSurfaceHref,
  normalizeSurfaceQuery,
  type SurfaceSearchParams
} from '@/routing/normalize-surface-query';

export const metadata: Metadata = { title: 'Issues assigned to you' };

export default async function AssignedIssuesPage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    q: { kind: 'text', maxLength: 200 },
    status: { kind: 'enum', values: ['open', 'closed', 'all'], defaultValue: 'open' },
    sort: { kind: 'enum', values: ['updated', 'created'], defaultValue: 'updated' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/issues/assigned', normalized));
  return (
    <SurfaceFrame
      availability='preview'
      controls={
        <QueryControls
          action='/issues/assigned'
          controls={[
            {
              kind: 'text',
              name: 'q',
              label: 'Search',
              value: normalized.values.q,
              placeholder: 'Issue title or body'
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
                { label: 'Recently updated', value: 'updated' },
                { label: 'Recently created', value: 'created' }
              ]
            }
          ]}
        />
      }
      description='Issues assigned to the current Actor across accessible Repositories. Assignment is responsibility and never grants access.'
      emptyTitle='Cross-Repository assigned Issue projection is not live'
      title='Issues assigned to you'
    />
  );
}
