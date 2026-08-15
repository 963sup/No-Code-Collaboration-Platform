import type { RepositoryReader } from '@no-code-collaboration-platform/application';
import type { RepositorySummary } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import { mapSupabaseRepositoryRow } from './supabase-repository-mapper';

const repositoryProjection =
  'id, owner_user_id, owner_organization_id, slug, name, description, visibility';

export class SupabaseRepositoryReader implements RepositoryReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findAccessibleRepositoryById(
    repositoryId: string
  ): Promise<RepositorySummary | null> {
    const { data, error } = await this.client
      .from('repositories')
      .select(repositoryProjection)
      .eq('id', repositoryId)
      .maybeSingle();

    if (error) throw new Error('Unable to load the accessible Repository.', { cause: error });

    return data ? mapSupabaseRepositoryRow(data) : null;
  }

  public async listAccessibleRepositories(): Promise<readonly RepositorySummary[]> {
    const { data, error } = await this.client
      .from('repositories')
      .select(repositoryProjection)
      .order('name');

    if (error) throw new Error('Unable to list accessible repositories.', { cause: error });

    return data.map(mapSupabaseRepositoryRow);
  }
}
