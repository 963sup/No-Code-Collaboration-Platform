import type { RepositorySummary } from '@no-code-collaboration-platform/domain';

import type { Database } from '../generated/database.types';

type RepositoryRow = Database['public']['Tables']['repositories']['Row'];

type AccessibleRepositoryRow = Pick<
  RepositoryRow,
  'description' | 'id' | 'name' | 'owner_organization_id' | 'owner_user_id' | 'slug' | 'visibility'
>;

export function mapSupabaseRepositoryRow(row: AccessibleRepositoryRow): RepositorySummary {
  if (row.owner_user_id !== null) {
    return {
      description: row.description,
      id: row.id,
      name: row.name,
      owner: {
        kind: 'user',
        userId: row.owner_user_id
      },
      slug: row.slug,
      visibility: row.visibility
    };
  }

  if (row.owner_organization_id !== null) {
    return {
      description: row.description,
      id: row.id,
      name: row.name,
      owner: {
        kind: 'organization',
        organizationId: row.owner_organization_id
      },
      slug: row.slug,
      visibility: row.visibility
    };
  }

  throw new Error('Repository row violates the exactly-one-owner invariant.');
}
