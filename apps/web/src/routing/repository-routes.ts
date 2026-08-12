export interface RepositoryRouteAddress {
  readonly organizationSlug: string;
  readonly repositorySlug: string;
}

export function repositoryPath(route: RepositoryRouteAddress) {
  return `/app/${encodeURIComponent(route.organizationSlug)}/${encodeURIComponent(route.repositorySlug)}`;
}

export function repositoryPagesPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/pages`;
}

export function repositoryPagePath(route: RepositoryRouteAddress, pageId: string) {
  return `${repositoryPagesPath(route)}/${encodeURIComponent(pageId)}`;
}

export function repositoryActivityPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/activity`;
}
