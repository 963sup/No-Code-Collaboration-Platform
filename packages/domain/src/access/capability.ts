export const repositoryRoles = ['viewer', 'contributor', 'manager', 'admin'] as const;

export type RepositoryRole = (typeof repositoryRoles)[number];

export const repositoryCapabilities = [
  'repository.view',
  'repository.manage',
  'resource.view',
  'resource.create',
  'resource.update',
  'resource.delete',
  'member.manage'
] as const;

export type RepositoryCapability = (typeof repositoryCapabilities)[number];

const capabilitiesByRole: Readonly<
  Record<RepositoryRole, readonly RepositoryCapability[]>
> = {
  viewer: ['repository.view', 'resource.view'],
  contributor: ['repository.view', 'resource.view', 'resource.create', 'resource.update'],
  manager: [
    'repository.view',
    'resource.view',
    'resource.create',
    'resource.update',
    'resource.delete',
    'member.manage'
  ],
  admin: repositoryCapabilities
};

const roleRank = {
  viewer: 10,
  contributor: 20,
  manager: 30,
  admin: 40
} as const satisfies Record<RepositoryRole, number>;

export function hasRepositoryCapability(
  role: RepositoryRole,
  capability: RepositoryCapability
): boolean {
  return capabilitiesByRole[role].includes(capability);
}

export function highestRepositoryRole(
  roles: readonly RepositoryRole[]
): RepositoryRole | null {
  return roles.reduce<RepositoryRole | null>((highest, candidate) => {
    if (highest === null || roleRank[candidate] > roleRank[highest]) return candidate;
    return highest;
  }, null);
}
