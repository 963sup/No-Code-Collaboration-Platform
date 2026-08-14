import type {
  RepositoryAccessQuery,
  RepositoryAccessReader
} from '@no-code-collaboration-platform/application';
import type { RepositoryAuthoritySources } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseRepositoryAccessReader implements RepositoryAccessReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async readRepositoryAccess(
    query: RepositoryAccessQuery
  ): Promise<RepositoryAuthoritySources> {
    const { data, error } = await this.client.rpc('get_current_repository_access_sources', {
      target_repository_id: query.repositoryId
    });

    if (error) {
      throw new Error('Unable to resolve Repository authority sources.', { cause: error });
    }

    const sources = data[0];
    return {
      directRole: sources?.direct_role ?? null,
      governanceRole: sources?.governance_role ?? null
    };
  }
}
