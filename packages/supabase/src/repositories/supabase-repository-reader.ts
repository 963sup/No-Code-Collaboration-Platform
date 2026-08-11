import type { RepositoryReader } from '@no-code-collaboration-platform/application';
import type { RepositorySummary } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseRepositoryReader implements RepositoryReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async listAccessibleRepositories(): Promise<readonly RepositorySummary[]> {
    const { data, error } = await this.client
      .from('repositories')
      .select('id, organization_id, slug, name, description, visibility')
      .order('name');

    if (error) throw new Error('Unable to list accessible repositories.', { cause: error });

    return data.map((repository) => ({
      id: repository.id,
      organizationId: repository.organization_id,
      slug: repository.slug,
      name: repository.name,
      description: repository.description,
      visibility: repository.visibility
    }));
  }
}
