import { describe, expect, it, vi } from 'vitest';

import {
  CreatePage,
  type IdentityProvider,
  type PageWriter,
  type RepositoryAuthoritySourceReader,
  type RepositoryReader
} from '../src/index';

const repository = {
  description: null,
  id: 'repository-1',
  name: 'Platform',
  organizationId: 'organization-1',
  slug: 'platform',
  visibility: 'private' as const
};

function createIdentityProvider(actorId: string | null): IdentityProvider {
  return {
    async authenticateWithPassword() {
      return { ok: false, reason: 'invalid-credentials' };
    },
    async getCurrentIdentity() {
      return actorId === null ? null : { email: 'actor@example.com', id: actorId };
    },
    async registerWithPassword() {
      return { ok: false, reason: 'registration-disabled' };
    },
    async resendEmailVerification() {
      return { ok: false, reason: 'provider-unavailable' };
    },
    async signOut() {},
    async verifyEmail() {
      return { ok: false, reason: 'invalid-code' };
    }
  };
}

function createRepositoryReader(): RepositoryReader {
  return {
    async findAccessibleRepositoryById() {
      return repository;
    },
    async listAccessibleRepositories() {
      return [repository];
    }
  };
}

describe('CreatePage', () => {
  it('rejects an unauthenticated request before reading Repository authority', async () => {
    const readRepositoryAuthoritySources = vi.fn();
    const createPage = vi.fn();
    const useCase = new CreatePage(
      createIdentityProvider(null),
      createRepositoryReader(),
      { readRepositoryAuthoritySources },
      { createPage, updatePage: vi.fn() }
    );

    await expect(useCase.execute({ repositoryId: repository.id, title: 'Page' })).resolves.toEqual({
      ok: false,
      reason: 'unauthenticated'
    });
    expect(readRepositoryAuthoritySources).not.toHaveBeenCalled();
    expect(createPage).not.toHaveBeenCalled();
  });

  it('rejects a Viewer through the Domain capability decision', async () => {
    const createPage = vi.fn();
    const authoritySourceReader: RepositoryAuthoritySourceReader = {
      async readRepositoryAuthoritySources() {
        return { directRole: 'viewer', organizationRole: null };
      }
    };
    const pageWriter: PageWriter = { createPage, updatePage: vi.fn() };
    const useCase = new CreatePage(
      createIdentityProvider('user-1'),
      createRepositoryReader(),
      authoritySourceReader,
      pageWriter
    );

    await expect(useCase.execute({ repositoryId: repository.id, title: 'Page' })).resolves.toEqual({
      ok: false,
      reason: 'forbidden'
    });
    expect(createPage).not.toHaveBeenCalled();
  });

  it('creates a normalized blank Page for a Contributor', async () => {
    const page = {
      content: { body: '' },
      createdAt: '2026-08-12T00:00:00.000Z',
      createdBy: 'user-1',
      id: 'page-1',
      kind: 'page' as const,
      repositoryId: repository.id,
      title: 'Product brief',
      updatedAt: '2026-08-12T00:00:00.000Z'
    };
    const createPage = vi.fn().mockResolvedValue(page);
    const useCase = new CreatePage(
      createIdentityProvider('user-1'),
      createRepositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'contributor', organizationRole: null };
        }
      },
      { createPage, updatePage: vi.fn() }
    );

    await expect(
      useCase.execute({ repositoryId: repository.id, title: '  Product brief  ' })
    ).resolves.toEqual({ ok: true, page });
    expect(createPage).toHaveBeenCalledWith({
      content: { body: '' },
      createdBy: 'user-1',
      kind: 'page',
      repositoryId: repository.id,
      title: 'Product brief'
    });
  });

  it('fails closed when persistence rejects a stale authority decision', async () => {
    const useCase = new CreatePage(
      createIdentityProvider('user-1'),
      createRepositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'contributor', organizationRole: null };
        }
      },
      { createPage: vi.fn().mockResolvedValue(null), updatePage: vi.fn() }
    );

    await expect(useCase.execute({ repositoryId: repository.id, title: 'Page' })).resolves.toEqual({
      ok: false,
      reason: 'forbidden'
    });
  });

  it('rejects an invalid title without entering persistence', async () => {
    const createPage = vi.fn();
    const useCase = new CreatePage(
      createIdentityProvider('user-1'),
      createRepositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'contributor', organizationRole: null };
        }
      },
      { createPage, updatePage: vi.fn() }
    );

    await expect(useCase.execute({ repositoryId: repository.id, title: '   ' })).resolves.toEqual({
      ok: false,
      reason: 'invalid-title'
    });
    expect(createPage).not.toHaveBeenCalled();
  });
});
