import {
  repositoryActivityPath,
  repositoryDiscussionsPath,
  repositoryIssuesPath,
  repositoryPagesPath,
  repositoryPath,
  repositoryProjectsPath,
  repositorySecurityPath,
  repositorySettingsPath,
  type RepositoryRouteAddress
} from './repository-routes';

export type SurfaceAvailability = 'live' | 'preview' | 'deferred';
type SurfacePlacement = 'primary' | 'discovery' | 'governance' | 'settings';
type SurfaceAudience = 'public' | 'authenticated' | 'repository-reader';

export interface SurfaceDefinition {
  readonly id: string;
  readonly href: string;
  readonly placement: SurfacePlacement;
  readonly audience: SurfaceAudience;
  readonly availability: SurfaceAvailability;
  readonly label: string;
  readonly description: string;
}

export const globalSurfaces: readonly SurfaceDefinition[] = [
  {
    id: 'dashboard',
    href: '/app',
    placement: 'primary',
    audience: 'authenticated',
    availability: 'live',
    label: 'Dashboard',
    description: 'Repositories and collaboration entry points.'
  },
  {
    id: 'repositories',
    href: '/repositories',
    placement: 'primary',
    audience: 'authenticated',
    availability: 'preview',
    label: 'Repositories',
    description: 'Accessible collaboration containers.'
  },
  {
    id: 'issues',
    href: '/issues?scope=assigned',
    placement: 'primary',
    audience: 'authenticated',
    availability: 'preview',
    label: 'Issues',
    description: 'Actionable work across accessible Repositories.'
  },
  {
    id: 'projects',
    href: '/projects',
    placement: 'primary',
    audience: 'authenticated',
    availability: 'live',
    label: 'Projects',
    description: 'Derived planning views across existing work.'
  },
  {
    id: 'discussions',
    href: '/discussions',
    placement: 'primary',
    audience: 'authenticated',
    availability: 'preview',
    label: 'Discussions',
    description: 'Shared-understanding conversations.'
  },
  {
    id: 'notifications',
    href: '/notifications',
    placement: 'primary',
    audience: 'authenticated',
    availability: 'live',
    label: 'Notifications',
    description: 'Actor-specific collaboration delivery.'
  },
  {
    id: 'search',
    href: '/search',
    placement: 'discovery',
    audience: 'public',
    availability: 'live',
    label: 'Search',
    description: 'Authorized no-code Repository and Artifact search.'
  },
  {
    id: 'explore',
    href: '/explore',
    placement: 'discovery',
    audience: 'public',
    availability: 'live',
    label: 'Explore',
    description: 'Public Repository discovery without personalization.'
  },
  {
    id: 'integrations',
    href: '/integrations',
    placement: 'discovery',
    audience: 'public',
    availability: 'preview',
    label: 'Integrations',
    description: 'Reviewed provider-neutral connector catalog.'
  },
  {
    id: 'profile',
    href: '/settings/profile',
    placement: 'settings',
    audience: 'authenticated',
    availability: 'preview',
    label: 'Profile',
    description: 'Personal identity presentation settings.'
  },
  {
    id: 'organizations',
    href: '/settings/organizations',
    placement: 'settings',
    audience: 'authenticated',
    availability: 'preview',
    label: 'Organizations',
    description: 'Membership and governance relationships.'
  },
  {
    id: 'enterprises',
    href: '/settings/enterprises',
    placement: 'settings',
    audience: 'authenticated',
    availability: 'deferred',
    label: 'Enterprises',
    description: 'Cross-Organization governance explanation only.'
  },
  {
    id: 'settings-integrations',
    href: '/settings/integrations',
    placement: 'settings',
    audience: 'authenticated',
    availability: 'deferred',
    label: 'Integration connections',
    description: 'Connection lifecycle is explicitly deferred.'
  }
] as const;

export function repositorySurfaces(route: RepositoryRouteAddress): readonly SurfaceDefinition[] {
  const basePath = repositoryPath(route);
  return [
    {
      id: 'overview',
      href: basePath,
      placement: 'primary',
      audience: 'repository-reader',
      availability: 'live',
      label: 'Overview',
      description: 'Repository collaboration summary.'
    },
    {
      id: 'issues',
      href: repositoryIssuesPath(route),
      placement: 'primary',
      audience: 'repository-reader',
      availability: 'live',
      label: 'Issues',
      description: 'Repository-scoped actionable work.'
    },
    {
      id: 'projects',
      href: repositoryProjectsPath(route),
      placement: 'primary',
      audience: 'repository-reader',
      availability: 'live',
      label: 'Projects',
      description: 'Derived planning over Repository work.'
    },
    {
      id: 'discussions',
      href: repositoryDiscussionsPath(route),
      placement: 'primary',
      audience: 'repository-reader',
      availability: 'live',
      label: 'Discussions',
      description: 'Repository shared-understanding conversations.'
    },
    {
      id: 'pages',
      href: repositoryPagesPath(route),
      placement: 'primary',
      audience: 'repository-reader',
      availability: 'live',
      label: 'Pages',
      description: 'Repository collaborative knowledge.'
    },
    {
      id: 'activity',
      href: repositoryActivityPath(route),
      placement: 'primary',
      audience: 'repository-reader',
      availability: 'live',
      label: 'Activity',
      description: 'Authorized historical Evidence projection.'
    },
    {
      id: 'security',
      href: repositorySecurityPath(route),
      placement: 'governance',
      audience: 'repository-reader',
      availability: 'preview',
      label: 'Security',
      description: 'Access posture without code scanning.'
    },
    {
      id: 'settings',
      href: repositorySettingsPath(route),
      placement: 'settings',
      audience: 'repository-reader',
      availability: 'preview',
      label: 'Settings',
      description: 'Repository collaboration settings intent.'
    }
  ] as const;
}
