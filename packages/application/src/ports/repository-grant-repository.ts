import type { RepositoryRole } from '@no-code-collaboration-platform/domain/access';

export interface RepositoryGrantUser {
  readonly avatarUrl: string | null;
  readonly displayName: string | null;
  readonly id: string;
  readonly username: string;
}

export interface DirectRepositoryGrant extends RepositoryGrantUser {
  readonly role: RepositoryRole;
}

export type RepositoryGrantMutationPersistenceResult =
  | { readonly ok: true; readonly changed: boolean }
  | {
      readonly ok: false;
      readonly reason: 'forbidden' | 'state-changed' | 'target-unavailable';
    };

export interface RepositoryGrantRepository {
  findGrantTargetByUsername(
    repositoryId: string,
    username: string
  ): Promise<RepositoryGrantUser | null>;
  listDirectRepositoryGrants(repositoryId: string): Promise<readonly DirectRepositoryGrant[]>;
  mutateDirectRepositoryGrant(input: {
    readonly expectedRole: RepositoryRole | null;
    readonly proposedRole: RepositoryRole | null;
    readonly repositoryId: string;
    readonly targetUserId: string;
  }): Promise<RepositoryGrantMutationPersistenceResult>;
}
