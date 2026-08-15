import type {
  RepositoryCreationAccessReader,
  RepositoryCreationOwnerCandidate
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseRepositoryCreationAccessReader implements RepositoryCreationAccessReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async listRepositoryCreationOwnerCandidates(
    actorId: string
  ): Promise<readonly RepositoryCreationOwnerCandidate[]> {
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
    ]);

    if (profileResult.error) {
      throw new Error('Unable to load the personal Repository creation scope.', {
        cause: profileResult.error
      });
    }
    if (membershipsResult.error) {
      throw new Error('Unable to load Organization Repository creation scopes.', {
        cause: membershipsResult.error
      });
    }

    const candidates: RepositoryCreationOwnerCandidate[] = [];
    const profile = profileResult.data;
    if (profile?.username) {
      candidates.push({
        name: profile.display_name ?? profile.username,
        organizationRole: null,
        owner: { kind: 'user', userId: profile.id },
        slug: profile.username
      });
    }

    for (const membership of membershipsResult.data) {
      const organization = membership.organizations;
      candidates.push({
        name: organization.name,
        organizationRole: membership.role,
        owner: { kind: 'organization', organizationId: organization.id },
        slug: organization.slug
      });
    }

    return candidates;
  }
}
