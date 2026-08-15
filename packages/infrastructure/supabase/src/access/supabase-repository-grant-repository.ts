import type {
  DirectRepositoryGrant,
  RepositoryGrantMutationPersistenceResult,
  RepositoryGrantRepository,
  RepositoryGrantUser
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

type DirectGrantRow =
  Database['public']['Functions']['list_repository_direct_grants']['Returns'][number];
type GrantTargetRow =
  Database['public']['Functions']['find_repository_grant_target_by_username']['Returns'][number];
type GrantCommandArgs = Database['public']['Functions']['execute_repository_grant_command']['Args'];

const accessDeniedCodes = new Set(['42501', 'PGRST301']);

function mapGrantUser(row: GrantTargetRow): RepositoryGrantUser {
  return {
    avatarUrl: row.avatar_url,
    displayName: row.display_name,
    id: row.user_id,
    username: row.username
  };
}

function mapDirectGrant(row: DirectGrantRow): DirectRepositoryGrant {
  return {
    ...mapGrantUser(row),
    role: row.role
  };
}

export class SupabaseRepositoryGrantRepository implements RepositoryGrantRepository {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findGrantTargetByUsername(
    repositoryId: string,
    username: string
  ): Promise<RepositoryGrantUser | null> {
    const { data, error } = await this.client.rpc('find_repository_grant_target_by_username', {
      target_repository_id: repositoryId,
      target_username: username
    });
    if (error) throw new Error('Unable to resolve the Repository Grant target.', { cause: error });
    const row = data[0];
    return row ? mapGrantUser(row) : null;
  }

  public async listDirectRepositoryGrants(
    repositoryId: string
  ): Promise<readonly DirectRepositoryGrant[]> {
    const { data, error } = await this.client.rpc('list_repository_direct_grants', {
      target_repository_id: repositoryId
    });
    if (error) throw new Error('Unable to list Direct Repository Grants.', { cause: error });
    return data.map(mapDirectGrant);
  }

  public async mutateDirectRepositoryGrant(input: {
    readonly expectedRole: DirectRepositoryGrant['role'] | null;
    readonly proposedRole: DirectRepositoryGrant['role'] | null;
    readonly repositoryId: string;
    readonly targetUserId: string;
  }): Promise<RepositoryGrantMutationPersistenceResult> {
    // PostgreSQL uses NULL here as part of the Grant state machine: expected NULL means
    // "Grant absent" and proposed NULL means "revoke". The generated Supabase RPC Args
    // projection does not express SQL function-argument nullability, so keep that projection
    // mismatch contained at this provider adapter boundary rather than inventing a Product sentinel.
    const commandArgs = {
      expected_role: input.expectedRole,
      proposed_role: input.proposedRole,
      target_repository_id: input.repositoryId,
      target_user_id: input.targetUserId
    } as unknown as GrantCommandArgs;
    const { data, error } = await this.client.rpc('execute_repository_grant_command', commandArgs);

    if (error) {
      if (accessDeniedCodes.has(error.code)) return { ok: false, reason: 'forbidden' };
      throw new Error('Unable to execute the Repository Grant command.', { cause: error });
    }

    switch (data) {
      case 'applied':
        return { ok: true, changed: true };
      case 'unchanged':
        return { ok: true, changed: false };
      case 'forbidden':
      case 'state-changed':
      case 'target-unavailable':
        return { ok: false, reason: data };
      default:
        throw new Error('Repository Grant command returned an unsupported persistence result.');
    }
  }
}
