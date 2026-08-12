import type { RepositorySummary } from '@no-code-collaboration-platform/domain';

export interface RepositoryRouteKey {
  readonly organizationSlug: string;
  readonly repositorySlug: string;
}

export interface RepositoryRouteSummary {
  readonly organizationSlug: string;
  readonly repository: RepositorySummary;
}

export interface RepositoryRouteReader {
  findAccessibleRepositoryRouteById(repositoryId: string): Promise<RepositoryRouteSummary | null>;
  findAccessibleRepositoryRouteByKey(
    key: RepositoryRouteKey
  ): Promise<RepositoryRouteSummary | null>;
  listAccessibleRepositoryRoutes(): Promise<readonly RepositoryRouteSummary[]>;
}
