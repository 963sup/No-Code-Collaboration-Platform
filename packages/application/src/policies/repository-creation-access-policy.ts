import {
  canCreateRepositoryForOwner,
  type RepositoryOwner
} from '@no-code-collaboration-platform/domain';

import type {
  RepositoryCreationAccessReader,
  RepositoryCreationOwner,
  RepositoryCreationOwnerCandidate
} from '../ports/repository-creation-access';

function sameOwner(left: RepositoryOwner, right: RepositoryOwner): boolean {
  if (left.kind === 'user' && right.kind === 'user') return left.userId === right.userId;
  if (left.kind === 'organization' && right.kind === 'organization') {
    return left.organizationId === right.organizationId;
  }
  return false;
}

function isAuthorizedCandidate(
  actorId: string,
  candidate: RepositoryCreationOwnerCandidate
): boolean {
  return canCreateRepositoryForOwner({
    actorId,
    organizationRole: candidate.organizationRole,
    owner: candidate.owner
  });
}

function toAuthorizedOwner(candidate: RepositoryCreationOwnerCandidate): RepositoryCreationOwner {
  return {
    name: candidate.name,
    owner: candidate.owner,
    slug: candidate.slug
  };
}

export class RepositoryCreationAccessPolicy {
  public constructor(private readonly accessReader: RepositoryCreationAccessReader) {}

  public async listAuthorizedOwners(actorId: string): Promise<readonly RepositoryCreationOwner[]> {
    const candidates = await this.accessReader.listRepositoryCreationOwnerCandidates(actorId);
    return candidates
      .filter((candidate) => isAuthorizedCandidate(actorId, candidate))
      .map(toAuthorizedOwner);
  }

  public async authorizeOwner(
    actorId: string,
    requestedOwner: RepositoryOwner
  ): Promise<RepositoryCreationOwner | null> {
    const owners = await this.listAuthorizedOwners(actorId);
    return owners.find(({ owner }) => sameOwner(owner, requestedOwner)) ?? null;
  }
}
