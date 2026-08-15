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

export function repositoryIssuesPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/issues`;
}

export function repositoryIssuePath(route: RepositoryRouteAddress, issueNumber: number) {
  return `${repositoryIssuesPath(route)}/${issueNumber}`;
}

export function repositoryPagePath(route: RepositoryRouteAddress, pageId: string) {
  return `${repositoryPagesPath(route)}/${encodeURIComponent(pageId)}`;
}

export function repositoryActivityPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/activity`;
}

export function repositoryProjectsPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/projects`;
}

export function repositoryDiscussionsPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/discussions`;
}

export function repositoryDiscussionPath(route: RepositoryRouteAddress, discussionNumber: number) {
  return `${repositoryDiscussionsPath(route)}/${discussionNumber}`;
}

export function repositorySecurityPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/security`;
}

export function repositorySettingsPath(route: RepositoryRouteAddress) {
  return `${repositoryPath(route)}/settings`;
}

export function repositorySettingsAccessPath(route: RepositoryRouteAddress) {
  return `${repositorySettingsPath(route)}/access`;
}
