import type { RepositorySummary } from '@no-code-collaboration-platform/domain';

import type { Database } from '../generated/database.types';

type RepositoryRow = Database['public']['Tables']['repositories']['Row'];

type AccessibleRepositoryRow = Pick<
  RepositoryRow,
  'description' | 'id' | 'name' | 'organization_id' | 'slug' | 'visibility'
>;

export function mapSupabaseRepositoryRow(row: AccessibleRepositoryRow): RepositorySummary {
  return {
    description: row.description,
    id: row.id,
    name: row.name,
    owner: {
      kind: 'organization',
      organizationId: row.organization_id
    },
    organizationId: row.organization_id,
    slug: row.slug,
    visibility: row.visibility === 'organization' ? 'private' : row.visibility
  };
}
