import {
  canMutateRepositoryGrant,
  canMutateRepositoryGrantForPrincipal,
  effectiveRepositoryRole,
  hasRepositoryCapability,
  repositoryRoles,
  type RepositoryRole
} from '@no-code-collaboration-platform/domain/access';

import type { IdentityProvider } from '../ports/identity-provider';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type {
  DirectRepositoryGrant,
  RepositoryGrantRepository
} from '../ports/repository-grant-repository';
import type { RepositoryReader } from '../ports/repository-reader';

export interface ManageableDirectRepositoryGrant extends DirectRepositoryGrant {
  readonly allowedRoles: readonly RepositoryRole[];
  readonly canRevoke: boolean;
}

export type GetRepositoryGrantManagementResult =
  | {
      readonly ok: true;
      readonly actorRole: RepositoryRole;
      readonly grantableRoles: readonly RepositoryRole[];
      readonly grants: readonly ManageableDirectRepositoryGrant[];
    }
  | {
      readonly ok: false;
      readonly reason: 'forbidden' | 'repository-unavailable' | 'unauthenticated';
    };

export class GetRepositoryGrantManagement {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader,
    private readonly repositoryGrantRepository: RepositoryGrantRepository
  ) {}

  public async execute(repositoryId: string): Promise<GetRepositoryGrantManagementResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (!actor) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(repositoryId);
    if (!repository) return { ok: false, reason: 'repository-unavailable' };

    const access = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId
    });
    if (!access) return { ok: false, reason: 'repository-unavailable' };

    const actorRole = effectiveRepositoryRole(access);
    if (actorRole === null || !hasRepositoryCapability(actorRole, 'repository.access.manage')) {
      return { ok: false, reason: 'forbidden' };
    }

    const grants = await this.repositoryGrantRepository.listDirectRepositoryGrants(repositoryId);
    return {
      ok: true,
      actorRole,
      grantableRoles: repositoryRoles.filter((role) =>
        canMutateRepositoryGrant(actorRole, null, role)
      ),
      grants: grants.map((grant) => ({
        ...grant,
        allowedRoles: repositoryRoles.filter(
          (role) =>
            role !== grant.role &&
            canMutateRepositoryGrantForPrincipal(actorRole, grant.role, role, actor.id, grant.id)
        ),
        canRevoke: canMutateRepositoryGrantForPrincipal(
          actorRole,
          grant.role,
          null,
          actor.id,
          grant.id
        )
      }))
    };
  }
}
