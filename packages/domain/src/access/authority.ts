import { highestRepositoryRole, type RepositoryRole } from './capability';

export interface RepositoryAuthoritySources {
  readonly directRole: RepositoryRole | null;
  readonly governanceRole: RepositoryRole | null;
}

export function effectiveRepositoryRole(
  sources: RepositoryAuthoritySources
): RepositoryRole | null {
  return highestRepositoryRole(
    [sources.directRole, sources.governanceRole].filter(
      (role): role is RepositoryRole => role !== null
    )
  );
}
