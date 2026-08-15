import {
  canMutateRepositoryGrantForPrincipal,
  effectiveRepositoryRole,
  type RepositoryRole
} from '@no-code-collaboration-platform/domain/access';

import type { IdentityProvider } from '../ports/identity-provider';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type { RepositoryGrantRepository } from '../ports/repository-grant-repository';
import type { RepositoryReader } from '../ports/repository-reader';

export type RepositoryGrantCommand =
  | {
      readonly type: 'grant';
      readonly repositoryId: string;
      readonly role: RepositoryRole;
      readonly username: string;
    }
  | {
      readonly type: 'change-role';
      readonly repositoryId: string;
      readonly role: RepositoryRole;
      readonly targetUserId: string;
    }
  | {
      readonly type: 'revoke';
      readonly repositoryId: string;
      readonly targetUserId: string;
    };

export type ExecuteRepositoryGrantCommandResult =
  | { readonly ok: true; readonly changed: boolean }
  | {
      readonly ok: false;
      readonly reason:
        | 'already-granted'
        | 'forbidden'
        | 'repository-unavailable'
        | 'state-changed'
        | 'target-unavailable'
        | 'unauthenticated';
    };

export class ExecuteRepositoryGrantCommand {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader,
    private readonly repositoryGrantRepository: RepositoryGrantRepository
  ) {}

  public async execute(
    command: RepositoryGrantCommand
  ): Promise<ExecuteRepositoryGrantCommandResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (!actor) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(
      command.repositoryId
    );
    if (!repository) return { ok: false, reason: 'repository-unavailable' };

    const access = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId: command.repositoryId
    });
    if (!access) return { ok: false, reason: 'repository-unavailable' };

    const actorRole = effectiveRepositoryRole(access.sources);
    if (actorRole === null) return { ok: false, reason: 'forbidden' };

    const grants = await this.repositoryGrantRepository.listDirectRepositoryGrants(
      command.repositoryId
    );

    let targetUserId: string;
    let expectedRole: RepositoryRole | null;
    let proposedRole: RepositoryRole | null;

    if (command.type === 'grant') {
      const target = await this.repositoryGrantRepository.findGrantTargetByUsername(
        command.repositoryId,
        command.username
      );
      if (!target) return { ok: false, reason: 'target-unavailable' };
      if (grants.some((grant) => grant.id === target.id)) {
        return { ok: false, reason: 'already-granted' };
      }
      targetUserId = target.id;
      expectedRole = null;
      proposedRole = command.role;
    } else {
      const current = grants.find((grant) => grant.id === command.targetUserId);
      if (!current) return { ok: false, reason: 'target-unavailable' };
      targetUserId = current.id;
      expectedRole = current.role;
      proposedRole = command.type === 'change-role' ? command.role : null;
    }

    if (
      !canMutateRepositoryGrantForPrincipal(
        actorRole,
        expectedRole,
        proposedRole,
        actor.id,
        targetUserId
      )
    ) {
      return { ok: false, reason: 'forbidden' };
    }

    return this.repositoryGrantRepository.mutateDirectRepositoryGrant({
      expectedRole,
      proposedRole,
      repositoryId: command.repositoryId,
      targetUserId
    });
  }
}
