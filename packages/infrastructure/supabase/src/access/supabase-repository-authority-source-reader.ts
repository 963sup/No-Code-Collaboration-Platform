import type {
  RepositoryAuthoritySourceQuery,
  RepositoryAuthoritySourceReader
} from '@no-code-collaboration-platform/application';
import type { RepositoryAuthoritySources } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseRepositoryAuthoritySourceReader
  implements RepositoryAuthoritySourceReader
{
  public constructor(private readonly client: SupabaseClient<Database>) {}

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
