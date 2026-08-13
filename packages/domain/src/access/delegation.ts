import { hasRepositoryCapability, repositoryRoles, type RepositoryRole } from './capability';

export const organizationRoles = ['member', 'admin', 'owner'] as const;

export type OrganizationRole = (typeof organizationRoles)[number];

const organizationDelegationByRole: Readonly<
  Record<OrganizationRole, readonly OrganizationRole[]>
> = {
  member: [],
  admin: ['member', 'admin'],
  owner: organizationRoles
};

const repositoryDelegationByRole: Readonly<Record<RepositoryRole, readonly RepositoryRole[]>> = {
  viewer: [],
  contributor: [],
  manager: ['viewer', 'contributor'],
  admin: repositoryRoles
};

function canMutateRoleWithinScope<Role extends string>(
  currentRole: Role | null,
  proposedRole: Role | null,
  manageableRoles: readonly Role[]
): boolean {
  if (currentRole === null && proposedRole === null) return false;

  return (
    (currentRole === null || manageableRoles.includes(currentRole)) &&
    (proposedRole === null || manageableRoles.includes(proposedRole))
  );
}

export function canMutateOrganizationMembership(
  actorRole: OrganizationRole,
  currentRole: OrganizationRole | null,
  proposedRole: OrganizationRole | null
): boolean {
  return canMutateRoleWithinScope(
    currentRole,
    proposedRole,
    organizationDelegationByRole[actorRole]
  );
}

export function canMutateRepositoryGrant(
  actorRole: RepositoryRole,
  currentRole: RepositoryRole | null,
  proposedRole: RepositoryRole | null
): boolean {
  return (
    hasRepositoryCapability(actorRole, 'member.manage') &&
    canMutateRoleWithinScope(currentRole, proposedRole, repositoryDelegationByRole[actorRole])
  );
}

export function preservesOrganizationOwnership(ownerCountAfterMutation: number): boolean {
  return Number.isInteger(ownerCountAfterMutation) && ownerCountAfterMutation >= 1;
}
