export type RepositoryRouteAddress =
  | {
      readonly ownerSlug: string;
      readonly repositorySlug: string;
    }
  | {
      readonly ownerSlug: string;
      readonly repository: {
        readonly slug: string;
      };
    };

function repositorySlug(route: RepositoryRouteAddress) {
  return 'repositorySlug' in route ? route.repositorySlug : route.repository.slug;
}

export function repositoryPath(route: RepositoryRouteAddress) {
  return `/${encodeURIComponent(route.ownerSlug)}/${encodeURIComponent(repositorySlug(route))}`;
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
