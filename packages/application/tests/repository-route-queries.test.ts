import { describe, expect, it, vi } from 'vitest';

import {
  GetAccessibleRepositoryRoute,
  GetAccessibleRepositoryRouteById,
  ListAccessibleRepositoryRoutes,
  type RepositoryRouteReader
} from '../src/index';

const route = {
  organizationSlug: 'example-organization',
  repository: {
    description: null,
    id: 'repository-1',
    name: 'Platform',
    organizationId: 'organization-1',
    slug: 'platform',
    visibility: 'private' as const
  }
};

describe('Repository semantic route queries', () => {
  it('resolves an accessible Repository by its human-readable namespace', async () => {
    const findAccessibleRepositoryRouteByKey = vi.fn().mockResolvedValue(route);
    const reader: RepositoryRouteReader = {
      async findAccessibleRepositoryRouteById() {
        return null;
      },
      findAccessibleRepositoryRouteByKey,
      async listAccessibleRepositoryRoutes() {
        return [];
      }
    };

    const query = new GetAccessibleRepositoryRoute(reader);

    await expect(
      query.execute({
        organizationSlug: route.organizationSlug,
        repositorySlug: route.repository.slug
      })
    ).resolves.toEqual(route);
    expect(findAccessibleRepositoryRouteByKey).toHaveBeenCalledWith({
      organizationSlug: route.organizationSlug,
      repositorySlug: route.repository.slug
    });
  });

  it('resolves a legacy stable Repository identity to its canonical route', async () => {
    const findAccessibleRepositoryRouteById = vi.fn().mockResolvedValue(route);
    const reader: RepositoryRouteReader = {
      findAccessibleRepositoryRouteById,
      async findAccessibleRepositoryRouteByKey() {
        return null;
      },
      async listAccessibleRepositoryRoutes() {
        return [];
      }
    };

    const query = new GetAccessibleRepositoryRouteById(reader);

    await expect(query.execute(route.repository.id)).resolves.toEqual(route);
    expect(findAccessibleRepositoryRouteById).toHaveBeenCalledWith(route.repository.id);
  });

  it('lists only route projections already visible to the current actor', async () => {
    const listAccessibleRepositoryRoutes = vi.fn().mockResolvedValue([route]);
    const reader: RepositoryRouteReader = {
      async findAccessibleRepositoryRouteById() {
        return null;
      },
      async findAccessibleRepositoryRouteByKey() {
        return null;
      },
      listAccessibleRepositoryRoutes
    };

    const query = new ListAccessibleRepositoryRoutes(reader);

    await expect(query.execute()).resolves.toEqual([route]);
    expect(listAccessibleRepositoryRoutes).toHaveBeenCalledOnce();
  });
});
