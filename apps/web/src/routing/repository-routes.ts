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
    }
  | {
      /** @deprecated Use ownerSlug. */
      readonly organizationSlug: string;
      readonly repositorySlug: string;
    }
  | {
      /** @deprecated Use ownerSlug. */
      readonly organizationSlug: string;
      readonly repository: {
        readonly slug: string;
      };
    };

function ownerSlug(route: RepositoryRouteAddress) {
  return 'ownerSlug' in route ? route.ownerSlug : route.organizationSlug;
}

function repositorySlug(route: RepositoryRouteAddress) {
  return 'repositorySlug' in route ? route.repositorySlug : route.repository.slug;
}

export function repositoryPath(route: RepositoryRouteAddress) {
  return `/${encodeURIComponent(ownerSlug(route))}/${encodeURIComponent(repositorySlug(route))}`;
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
