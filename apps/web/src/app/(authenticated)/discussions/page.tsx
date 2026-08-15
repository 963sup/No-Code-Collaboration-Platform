import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { QueryControls } from '@/components/query-controls';
import { SurfaceFrame } from '@/components/surface-frame';
import {
  canonicalSurfaceHref,
  normalizeSurfaceQuery,
  type SurfaceSearchParams
} from '@/routing/normalize-surface-query';

export const metadata: Metadata = { title: 'Discussions' };

export default async function DiscussionsPage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    category: {
      kind: 'enum',
      values: ['all', 'general', 'question', 'announcement'],
      defaultValue: 'all'
    },
    status: { kind: 'enum', values: ['open', 'closed', 'all'], defaultValue: 'open' },
    sort: { kind: 'enum', values: ['updated', 'created'], defaultValue: 'updated' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/discussions', normalized));
  return (
    <SurfaceFrame
      availability='preview'
      controls={
        <QueryControls
          action='/discussions'
          controls={[
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
                { label: 'Recently updated', value: 'updated' },
                { label: 'Recently created', value: 'created' }
              ]
            }
          ]}
        />
      }
      description='Shared-understanding conversations across accessible Repositories. Discussion is an Artifact, never another forum Container.'
      emptyTitle='Cross-Repository Discussion projection is not live'
      title='Discussions'
    />
  );
}
