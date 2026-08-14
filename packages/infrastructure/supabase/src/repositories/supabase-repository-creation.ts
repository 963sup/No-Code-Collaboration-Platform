import type {
  RepositoryCreationOwner,
  RepositoryCreationOwnerReader,
  RepositoryPersistenceResult,
  RepositoryWriter
} from '@no-code-collaboration-platform/application';
import type { RepositoryDraft } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseRepositoryCreation implements RepositoryCreationOwnerReader, RepositoryWriter {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async listCreatableRepositoryOwners(
    actorId: string
  ): Promise<readonly RepositoryCreationOwner[]> {
    const [profileResult, membershipsResult] = await Promise.all([
      this.client
        .from('profiles')
        .select('id, username, display_name')
        .eq('id', actorId)
        .maybeSingle(),
      this.client
        .from('organization_memberships')
        .select('role, organizations!inner(id, slug, name)')
        .eq('user_id', actorId)
        .in('role', ['admin', 'owner'])
    ]);

    if (profileResult.error) {
      throw new Error('Unable to load the personal Repository owner.', {
        cause: profileResult.error
      });
    }
    if (membershipsResult.error) {
      throw new Error('Unable to load Organization Repository owners.', {
        cause: membershipsResult.error
      });
    }

    const owners: RepositoryCreationOwner[] = [];
    const profile = profileResult.data;
    if (profile?.username) {
      owners.push({
        name: profile.display_name ?? profile.username,
        owner: { kind: 'user', userId: profile.id },
        slug: profile.username
      });
    }

    for (const membership of membershipsResult.data) {
      const organization = membership.organizations;
      owners.push({
        name: organization.name,
        owner: { kind: 'organization', organizationId: organization.id },
        slug: organization.slug
      });
    }

    return owners;
  }

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
