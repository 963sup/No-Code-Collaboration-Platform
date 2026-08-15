import type {
  RepositoryPersistenceResult,
  RepositoryWriter
} from '@no-code-collaboration-platform/application';
import type { RepositoryDraft } from '@no-code-collaboration-platform/domain/repository';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseRepositoryWriter implements RepositoryWriter {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async createRepository(draft: RepositoryDraft): Promise<RepositoryPersistenceResult> {
    const repositoryId = crypto.randomUUID();
    const ownerColumns =
      draft.owner.kind === 'user'
        ? { owner_organization_id: null, owner_user_id: draft.owner.userId }
        : { owner_organization_id: draft.owner.organizationId, owner_user_id: null };

    // Keep the response minimal: the private SELECT policy resolves authority from the base row,
    // which PostgREST cannot observe yet during the same INSERT-returning statement.
    const { error } = await this.client.from('repositories').insert({
      created_by: draft.createdBy,
      description: draft.description,
      id: repositoryId,
      name: draft.name,
      ...ownerColumns,
      slug: draft.slug,
      visibility: draft.visibility
    });

    if (error?.code === '23505') return { ok: false, reason: 'slug-taken' };
    if (error?.code === '42501') return { ok: false, reason: 'forbidden' };
    if (error) throw new Error('Unable to create the Repository.', { cause: error });

    return {
      ok: true,
      repository: {
        description: draft.description,
        id: repositoryId,
        name: draft.name,
        owner: draft.owner,
        slug: draft.slug,
        visibility: draft.visibility
      }
    };
  }
}
