import type { OrganizationRole, RepositoryOwner } from '@no-code-collaboration-platform/domain';

export interface RepositoryCreationOwner {
  readonly name: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
}

export interface RepositoryCreationOwnerCandidate extends RepositoryCreationOwner {
  readonly organizationRole: OrganizationRole | null;
}

export interface RepositoryCreationAccessReader {
  listRepositoryCreationOwnerCandidates(
    actorId: string
  ): Promise<readonly RepositoryCreationOwnerCandidate[]>;
}
