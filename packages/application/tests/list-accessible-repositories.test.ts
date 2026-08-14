import { describe, expect, it } from 'vitest';

import type { RepositoryReader } from '../src/index';
import { ListAccessibleRepositories } from '../src/index';

const repositories = [
  {
    id: 'repository-1',
    owner: {
      kind: 'organization' as const,
      organizationId: 'organization-1'
    },
    slug: 'platform',
    name: 'Platform',
    description: null,
    visibility: 'private' as const
  }
];

describe('ListAccessibleRepositories', () => {
  it('returns only what the authorization-aware reader exposes', async () => {
    const reader: RepositoryReader = {
      async findAccessibleRepositoryById() {
        return null;
      },
      async listAccessibleRepositories() {
        return repositories;
      }
    };

    const useCase = new ListAccessibleRepositories(reader);

    await expect(useCase.execute()).resolves.toEqual(repositories);
  });
});
