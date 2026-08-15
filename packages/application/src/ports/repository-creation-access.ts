import type { OrganizationRole } from '@no-code-collaboration-platform/domain/access';
import type { RepositoryOwner } from '@no-code-collaboration-platform/domain/repository';

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
