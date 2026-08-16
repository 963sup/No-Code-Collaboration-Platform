import {
  explainRepositoryAccess,
  type RepositoryAccessExplanation
} from '@no-code-collaboration-platform/domain/access';

import type { IdentityProvider } from '../ports/identity-provider';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type { RepositoryReader } from '../ports/repository-reader';

export type ExplainCurrentRepositoryAccessFailureReason =
  | 'repository-unavailable'
  | 'unauthenticated';

export type ExplainCurrentRepositoryAccessResult =
  | {
      readonly actorId: string;
      readonly explanation: RepositoryAccessExplanation;
      readonly ok: true;
      readonly repositoryId: string;
    }
  | {
      readonly ok: false;
      readonly reason: ExplainCurrentRepositoryAccessFailureReason;
    };

export class ExplainCurrentRepositoryAccess {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader
  ) {}

  public async execute(repositoryId: string): Promise<ExplainCurrentRepositoryAccessResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(repositoryId);
    if (repository === null) return { ok: false, reason: 'repository-unavailable' };

    const sources = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId: repository.id
    });

    return {
      actorId: actor.id,
      explanation: explainRepositoryAccess({
        actorTrust: 'authenticated',
        sources,
        visibility: repository.visibility
      }),
      ok: true,
      repositoryId: repository.id
    };
  }
}
