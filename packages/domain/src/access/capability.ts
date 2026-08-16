export const repositoryRoles = ['read', 'triage', 'write', 'maintain', 'admin'] as const;

export const repositoryCapabilities = [
  'repository.view',
  'repository.manage',
  'repository.access.manage',
  'resource.view',
  'page.create',
  'page.update',
  'issue.create',
  'issue.comment',
  'issue.edit',
  'issue.manage',
  'discussion.create',
  'discussion.comment',
  'discussion.comment.locked',
  'discussion.edit',
  'discussion.moderate',
  'discussion.announce'
] as const;

export type RepositoryRole = (typeof repositoryRoles)[number];
export type RepositoryCapability = (typeof repositoryCapabilities)[number];

const readCapabilities = [
  'repository.view',
  'resource.view',
  'issue.create',
  'issue.comment',
  'discussion.create',
  'discussion.comment'
] as const satisfies readonly RepositoryCapability[];

const triageCapabilities = [
  ...readCapabilities,
  'issue.manage',
  'discussion.edit',
  'discussion.moderate'
] as const satisfies readonly RepositoryCapability[];

const writeCapabilities = [
  ...triageCapabilities,
  'page.create',
  'page.update',
  'issue.edit',
  'discussion.comment.locked'
] as const satisfies readonly RepositoryCapability[];

const maintainCapabilities = [
  ...writeCapabilities,
  'discussion.announce'
] as const satisfies readonly RepositoryCapability[];

const repositoryCapabilitiesByRole: Readonly<
  Record<RepositoryRole, readonly RepositoryCapability[]>
> = {
  read: readCapabilities,
  triage: triageCapabilities,
  write: writeCapabilities,
  maintain: maintainCapabilities,
  admin: repositoryCapabilities
};

const repositoryRoleRank: Readonly<Record<RepositoryRole, number>> = {
  read: 10,
  triage: 20,
  write: 30,
  maintain: 40,
  admin: 50
};

export function hasRepositoryCapability(
  role: RepositoryRole,
  capability: RepositoryCapability
): boolean {
  return repositoryCapabilitiesByRole[role].includes(capability);
}

export function highestRepositoryRole(roles: readonly RepositoryRole[]): RepositoryRole | null {
  return roles.reduce<RepositoryRole | null>((highest, role) => {
    if (highest === null || repositoryRoleRank[role] > repositoryRoleRank[highest]) return role;
    return highest;
  }, null);
}
