import { describe, expect, it, vi } from 'vitest';

import { GetAccessibleRepository, type RepositoryReader } from '../src/index';

const repository = {
  id: 'repository-1',
  owner: {
    kind: 'organization' as const,
    organizationId: 'organization-1'
  },
  slug: 'platform',
  name: 'Platform',
  description: null,
  visibility: 'private' as const
};

describe('GetAccessibleRepository', () => {
  it('returns the authorization-aware Repository projection for the requested identity', async () => {
    const findAccessibleRepositoryById = vi.fn().mockResolvedValue(repository);
    const reader: RepositoryReader = {
      findAccessibleRepositoryById,
      async listAccessibleRepositories() {
        return [];
      }
    };

    const useCase = new GetAccessibleRepository(reader);

    await expect(useCase.execute(repository.id)).resolves.toEqual(repository);
    expect(findAccessibleRepositoryById).toHaveBeenCalledWith(repository.id);
  });

  it('returns null when the Repository is absent or hidden by authorization', async () => {
    const reader: RepositoryReader = {
      async findAccessibleRepositoryById() {
        return null;
      },
      async listAccessibleRepositories() {
        return [];
      }
    };

    const useCase = new GetAccessibleRepository(reader);

    await expect(useCase.execute('unavailable')).resolves.toBeNull();
  });
});
