import type { RepositorySummary } from '@no-code-collaboration-platform/domain/repository';

export interface RepositoryRouteKey {
  readonly ownerSlug: string;
  readonly repositorySlug: string;
}

export interface RepositoryRouteSummary {
  readonly ownerSlug: string;
  readonly repository: RepositorySummary;
}

export interface RepositoryRouteReader {
  findAccessibleRepositoryRouteById(repositoryId: string): Promise<RepositoryRouteSummary | null>;
  findAccessibleRepositoryRouteByKey(
    key: RepositoryRouteKey
  ): Promise<RepositoryRouteSummary | null>;
  listAccessibleRepositoryRoutes(): Promise<readonly RepositoryRouteSummary[]>;
}
