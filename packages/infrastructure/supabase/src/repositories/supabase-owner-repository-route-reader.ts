import type {
  RepositoryRouteKey,
  RepositoryRouteReader,
  RepositoryRouteSummary
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

type RepositoryRouteRow =
  Database['public']['Functions']['list_accessible_repository_routes']['Returns'][number];

function mapRepositoryRoute(row: RepositoryRouteRow): RepositoryRouteSummary {
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

export class SupabaseOwnerRepositoryRouteReader implements RepositoryRouteReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findAccessibleRepositoryRouteById(
    repositoryId: string
  ): Promise<RepositoryRouteSummary | null> {
    const { data, error } = await this.client.rpc('get_accessible_repository_route_by_id', {
      target_repository_id: repositoryId
    });

    if (error) {
      throw new Error('Unable to resolve the accessible Repository route.', { cause: error });
    }

    const row = data[0];
    return row ? mapRepositoryRoute(row) : null;
  }

  public async findAccessibleRepositoryRouteByKey(
    key: RepositoryRouteKey
  ): Promise<RepositoryRouteSummary | null> {
    const { data, error } = await this.client.rpc('get_accessible_repository_route_by_key', {
      target_owner_slug: key.ownerSlug,
      target_repository_slug: key.repositorySlug
    });

    if (error) {
      throw new Error('Unable to resolve the accessible Repository route.', { cause: error });
    }

    const row = data[0];
    return row ? mapRepositoryRoute(row) : null;
  }

  public async listAccessibleRepositoryRoutes(): Promise<readonly RepositoryRouteSummary[]> {
    const { data, error } = await this.client.rpc('list_accessible_repository_routes');

    if (error) {
      throw new Error('Unable to list accessible Repository routes.', { cause: error });
    }

    return data.map(mapRepositoryRoute);
  }
}
