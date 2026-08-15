import type {
  OwnerProfile,
  OwnerProfileReader,
  RepositoryRouteSummary
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

type OwnerProfileRow =
  Database['public']['Functions']['get_owner_profile_by_slug']['Returns'][number];
type OwnerRepositoryRouteRow =
  Database['public']['Functions']['list_owner_repository_routes']['Returns'][number];

function mapOwnerProfile(row: OwnerProfileRow): OwnerProfile {
  if (row.owner_kind !== 'user' && row.owner_kind !== 'organization') {
    throw new Error('Owner profile returned an unsupported Owner kind.');
  }

  return {
    avatarUrl: row.avatar_url,
    displayName: row.display_name,
    id: row.owner_id,
    kind: row.owner_kind,
    slug: row.owner_slug
  };
}

function mapRepositoryRoute(row: OwnerRepositoryRouteRow): RepositoryRouteSummary {
  return {
    ownerSlug: row.owner_slug,
    repository: {
      description: row.description,
      id: row.id,
      name: row.name,
      owner:
        row.owner_kind === 'user'
          ? { kind: 'user', userId: row.owner_id }
          : { kind: 'organization', organizationId: row.owner_id },
      slug: row.slug,
      visibility: row.visibility
    }
  };
}

export class SupabaseOwnerProfileReader implements OwnerProfileReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findOwnerProfileBySlug(ownerSlug: string): Promise<OwnerProfile | null> {
    const { data, error } = await this.client.rpc('get_owner_profile_by_slug', {
      target_owner_slug: ownerSlug
    });

    if (error) throw new Error('Unable to resolve the Owner profile.', { cause: error });

    const row = data[0];
    return row ? mapOwnerProfile(row) : null;
  }

  public async listAccessibleOwnerRepositoryRoutes(
    ownerSlug: string
  ): Promise<readonly RepositoryRouteSummary[]> {
    const { data, error } = await this.client.rpc('list_owner_repository_routes', {
      target_owner_slug: ownerSlug
    });

    if (error) throw new Error('Unable to list Owner Repository routes.', { cause: error });

    return data.map(mapRepositoryRoute);
  }
}
