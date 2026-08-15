import type { OrganizationRole } from './delegation';
import type { RepositoryOwner } from '../repository/ownership';

export const repositoryCreationCapability = 'repository.create' as const;

export interface RepositoryCreationPolicyInput {
  readonly actorId: string;
  readonly organizationRole: OrganizationRole | null;
  readonly owner: RepositoryOwner;
}

export function canCreateRepositoryForOwner(input: RepositoryCreationPolicyInput): boolean {
  if (input.actorId.length === 0) return false;

  if (input.owner.kind === 'user') {
    return input.organizationRole === null && input.owner.userId === input.actorId;
  }

  return input.organizationRole === 'admin' || input.organizationRole === 'owner';
}
