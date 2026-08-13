import type {
  RepositoryAccessQuery,
  RepositoryAccessReader,
  RepositoryAuthoritySourceQuery,
  RepositoryAuthoritySourceReader
} from '@no-code-collaboration-platform/application';
import type { RepositoryAuthoritySources } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

interface OwnerRouteProjection {
  readonly owner_id: string;
  readonly owner_kind: 'organization' | 'user';
}

export class SupabaseRepositoryAuthoritySourceReader
  implements RepositoryAuthoritySourceReader, RepositoryAccessReader
{
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async readRepositoryAccess(
    query: RepositoryAccessQuery
  ): Promise<RepositoryAuthoritySources> {
    const [routeResult, directGrantResult] = await Promise.all([
      this.client.rpc('get_accessible_repository_route_by_id', {
        target_repository_id: query.repositoryId
      }),
      this.client
        .from('repository_user_grants')
        .select('role')
        .eq('repository_id', query.repositoryId)
        .eq('user_id', query.actorId)
        .maybeSingle()
    ]);

    if (routeResult.error) {
      throw new Error('Unable to resolve the Repository owner authority source.', {
        cause: routeResult.error
      });
    }
    if (directGrantResult.error) {
      throw new Error('Unable to load the direct Repository authority source.', {
        cause: directGrantResult.error
      });
    }

    const route = routeResult.data[0] as unknown as OwnerRouteProjection | undefined;
    if (!route) {
      return { directRole: directGrantResult.data?.role ?? null, governanceRole: null };
    }

    if (route.owner_kind === 'user') {
      return {
        directRole: directGrantResult.data?.role ?? null,
        governanceRole: route.owner_id === query.actorId ? 'admin' : null
      };
    }

    const membershipResult = await this.client
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', route.owner_id)
      .eq('user_id', query.actorId)
      .maybeSingle();

    if (membershipResult.error) {
      throw new Error('Unable to load the Organization governance authority source.', {
        cause: membershipResult.error
      });
    }

    return {
      directRole: directGrantResult.data?.role ?? null,
      governanceRole:
        membershipResult.data?.role === 'admin' || membershipResult.data?.role === 'owner'
          ? 'admin'
          : null
    };
  }

  public async readRepositoryAuthoritySources(
    query: RepositoryAuthoritySourceQuery
  ): Promise<RepositoryAuthoritySources> {
    const [membershipResult, directGrantResult] = await Promise.all([
      this.client
        .from('organization_memberships')
        .select('role')
        .eq('organization_id', query.organizationId)
        .eq('user_id', query.actorId)
        .maybeSingle(),
      this.client
        .from('repository_user_grants')
        .select('role')
        .eq('repository_id', query.repositoryId)
        .eq('user_id', query.actorId)
        .maybeSingle()
    ]);

    if (membershipResult.error) {
      throw new Error('Unable to load the Organization authority source.', {
        cause: membershipResult.error
      });
    }
    if (directGrantResult.error) {
      throw new Error('Unable to load the direct Repository authority source.', {
        cause: directGrantResult.error
      });
    }

    return {
      directRole: directGrantResult.data?.role ?? null,
      organizationRole: membershipResult.data?.role ?? null
    };
  }
}
