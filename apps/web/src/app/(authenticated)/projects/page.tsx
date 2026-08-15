import { ListProjectItems } from '@no-code-collaboration-platform/application';
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

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    type: { kind: 'enum', values: ['all', 'issue', 'discussion', 'page'], defaultValue: 'all' },
    status: { kind: 'enum', values: ['active', 'open', 'closed', 'all'], defaultValue: 'active' },
    assignee: { kind: 'uuid' },
    label: { kind: 'uuid' },
    sort: { kind: 'enum', values: ['updated', 'created'], defaultValue: 'updated' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/projects', normalized));
  const services = await createRequestServices();
  const page = await new ListProjectItems(services.projectReader).execute({
    assigneeId: normalized.values.assignee,
    labelId: normalized.values.label,
    page: Number(normalized.values.page),
    sort: normalized.values.sort,
    status: normalized.values.status === 'all' ? '' : normalized.values.status,
    type: normalized.values.type
  });
  return (
    <SurfaceFrame
      availability='live'
      controls={
        <QueryControls
          action='/projects'
          controls={[
            {
              kind: 'select',
              name: 'type',
              label: 'Artifact type',
              value: normalized.values.type,
              options: [
                { label: 'All work', value: 'all' },
                { label: 'Issues', value: 'issue' },
                { label: 'Discussions', value: 'discussion' },
                { label: 'Pages', value: 'page' }
              ]
            },
            {
              kind: 'select',
              name: 'status',
              label: 'Status',
              value: normalized.values.status,
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Open', value: 'open' },
                { label: 'Closed', value: 'closed' },
                { label: 'All', value: 'all' }
              ]
            },
            {
              kind: 'text',
              name: 'assignee',
              label: 'Assignee',
              value: normalized.values.assignee,
              placeholder: 'User ID'
            },
            {
              kind: 'text',
              name: 'label',
              label: 'Label',
              value: normalized.values.label,
              placeholder: 'Repository label ID'
            }
          ]}
        />
      }
      description='A derived planning view over work the Actor can already read. It has no Project entity, create command, saved view, owner, or authority.'
      emptyTitle='No planning rows match this view'
      title={`Projects${page.total ? ` · ${page.total}` : ''}`}
    >
      {page.items.length ? (
        <ProjectionList
          items={page.items.map((item) => ({
            href: item.href,
            id: item.id,
            metadata: `${item.status} · updated ${new Date(item.updatedAt).toLocaleDateString()}`,
            title: item.title,
            type: item.type
          }))}
        />
      ) : undefined}
    </SurfaceFrame>
  );
}
