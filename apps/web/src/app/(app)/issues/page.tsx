import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { QueryControls } from '@/components/query-controls';
import { SurfaceFrame } from '@/components/surface-frame';
import {
  canonicalSurfaceHref,
  normalizeSurfaceQuery,
  type SurfaceSearchParams
} from '@/routing/normalize-surface-query';

export const metadata: Metadata = { title: 'Issues' };

export default async function GlobalIssuesPage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    scope: {
      kind: 'enum',
      values: ['assigned', 'created', 'participating'],
      defaultValue: 'assigned'
    },
    q: { kind: 'text', maxLength: 200 },
    status: { kind: 'enum', values: ['open', 'closed', 'all'], defaultValue: 'open' },
    sort: { kind: 'enum', values: ['updated', 'created'], defaultValue: 'updated' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/issues', normalized));
  return (
    <SurfaceFrame
      availability='preview'
      controls={
        <QueryControls
          action='/issues'
          controls={[
            {
              kind: 'select',
              name: 'scope',
              label: 'Scope',
              value: normalized.values.scope,
              options: [
                { label: 'Assigned to me', value: 'assigned' },
                { label: 'Created by me', value: 'created' },
                { label: 'Participating', value: 'participating' }
              ]
            },
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
      description='Actor-scoped actionable work across accessible Repositories. Assignment is responsibility and never grants access.'
      emptyTitle='Cross-Repository Issue projection is not live'
      title='Issues'
    />
  );
}
