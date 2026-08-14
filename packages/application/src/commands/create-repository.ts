import {
  createRepositoryDraft,
  type RepositoryOwner,
  type RepositorySummary
} from '@no-code-collaboration-platform/domain';

import type { IdentityProvider } from '../ports/identity-provider';
import type {
  RepositoryCreationOwner,
  RepositoryCreationOwnerReader,
  RepositoryWriter
} from '../ports/repository-creation';

export interface CreateRepositoryInput {
  readonly description?: string | null;
  readonly name: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
  readonly visibility: string;
}

export type CreateRepositoryFailureReason =
  | 'forbidden'
  | 'invalid-input'
  | 'slug-taken'
  | 'unauthenticated';

export type CreateRepositoryResult =
  | {
      readonly ok: true;
      readonly ownerSlug: string;
      readonly repository: RepositorySummary;
    }
  | {
      readonly ok: false;
      readonly reason: CreateRepositoryFailureReason;
    };

function sameOwner(left: RepositoryOwner, right: RepositoryOwner): boolean {
  if (left.kind === 'user' && right.kind === 'user') return left.userId === right.userId;
  if (left.kind === 'organization' && right.kind === 'organization') {
    return left.organizationId === right.organizationId;
  }
  return false;
}

function findRequestedOwner(
  owners: readonly RepositoryCreationOwner[],
  requestedOwner: RepositoryOwner
) {
  return owners.find(({ owner }) => sameOwner(owner, requestedOwner));
}

export class CreateRepository {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly ownerReader: RepositoryCreationOwnerReader,
    private readonly repositoryWriter: RepositoryWriter
  ) {}

  public async execute(input: CreateRepositoryInput): Promise<CreateRepositoryResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const availableOwners = await this.ownerReader.listCreatableRepositoryOwners(actor.id);
    const selectedOwner = findRequestedOwner(availableOwners, input.owner);
    if (!selectedOwner) return { ok: false, reason: 'forbidden' };

    const draft = createRepositoryDraft({
      createdBy: actor.id,
      description: input.description,
      name: input.name,
      owner: selectedOwner.owner,
      slug: input.slug,
      visibility: input.visibility
    });
    if (!draft) return { ok: false, reason: 'invalid-input' };

    const persisted = await this.repositoryWriter.createRepository(draft);
    if (!persisted.ok) return persisted;

    return {
      ok: true,
      ownerSlug: selectedOwner.slug,
      repository: persisted.repository
    };
  }
}
