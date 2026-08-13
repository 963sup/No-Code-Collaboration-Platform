import { highestRepositoryRole, type RepositoryRole } from './capability';
import type { OrganizationRole } from './delegation';

export interface RepositoryAuthoritySources {
  readonly directRole: RepositoryRole | null;
  readonly governanceRole?: RepositoryRole | null;
  /** @deprecated Use governanceRole after ownership migration completes. */
  readonly organizationRole?: OrganizationRole | null;
}

export function effectiveRepositoryRole(
  sources: RepositoryAuthoritySources
): RepositoryRole | null {
  const roles: RepositoryRole[] = [];

  if (sources.directRole !== null) roles.push(sources.directRole);
  if (sources.governanceRole) roles.push(sources.governanceRole);
  if (
    sources.governanceRole === undefined &&
    (sources.organizationRole === 'admin' || sources.organizationRole === 'owner')
  ) {
    roles.push('admin');
  }

  return highestRepositoryRole(roles);
}
