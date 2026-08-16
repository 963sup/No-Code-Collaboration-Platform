import { describe, expect, it, vi } from 'vitest';

import {
  CreatePage,
  type IdentityProvider,
  type PageWriter,
  type RepositoryAccessReader,
  type RepositoryReader
} from '../src/index';

const repository = {
  description: null,
  id: 'repository-1',
  name: 'Platform',
  owner: {
    kind: 'organization' as const,
    organizationId: 'organization-1'
  },
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
    async getPasswordRecoveryIdentity() {
      return null;
    },
    async registerWithPassword() {
      return { ok: false, reason: 'registration-disabled' };
    },
    async requestPasswordRecovery() {
      return { ok: false, reason: 'provider-unavailable' };
    },
    async resendEmailVerification() {
      return { ok: false, reason: 'provider-unavailable' };
    },
    async resetPassword() {
      return { ok: false, reason: 'invalid-recovery-session' };
    },
    async signOut() {},
    async verifyEmail() {
      return { ok: false, reason: 'invalid-code' };
    },
    async verifyPasswordRecovery() {
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
    const readRepositoryAccess = vi.fn();
    const createPage = vi.fn();
    const accessReader: RepositoryAccessReader = { readRepositoryAccess };
    const useCase = new CreatePage(
      createIdentityProvider(null),
      createRepositoryReader(),
      accessReader,
      { createPage, updatePage: vi.fn() }
    );

    await expect(useCase.execute({ repositoryId: repository.id, title: 'Page' })).resolves.toEqual({
      ok: false,
      reason: 'unauthenticated'
    });
    expect(readRepositoryAccess).not.toHaveBeenCalled();
    expect(createPage).not.toHaveBeenCalled();
  });

  it('rejects Read through the Domain capability decision', async () => {
    const createPage = vi.fn();
    const accessReader: RepositoryAccessReader = {
      async readRepositoryAccess() {
        return { directRole: 'read', governanceRole: null };
      }
    };
    const pageWriter: PageWriter = { createPage, updatePage: vi.fn() };
    const useCase = new CreatePage(
      createIdentityProvider('user-1'),
      createRepositoryReader(),
      accessReader,
      pageWriter
    );

    await expect(useCase.execute({ repositoryId: repository.id, title: 'Page' })).resolves.toEqual({
      ok: false,
      reason: 'forbidden'
    });
    expect(createPage).not.toHaveBeenCalled();
  });

  it('accepts Organization admin governance authority without a fabricated direct grant', async () => {
    const page = {
      content: { body: '' },
      createdAt: '2026-08-12T00:00:00.000Z',
      createdBy: 'user-1',
      id: 'page-governance',
      kind: 'page' as const,
      repositoryId: repository.id,
      title: 'Governed Page',
      updatedAt: '2026-08-12T00:00:00.000Z'
    };
    const createPage = vi.fn().mockResolvedValue(page);
    const useCase = new CreatePage(
      createIdentityProvider('user-1'),
      createRepositoryReader(),
      {
        async readRepositoryAccess() {
          return { directRole: null, governanceRole: 'admin' };
        }
      },
      { createPage, updatePage: vi.fn() }
    );

    await expect(
      useCase.execute({ repositoryId: repository.id, title: 'Governed Page' })
    ).resolves.toEqual({ ok: true, page });
    expect(createPage).toHaveBeenCalledTimes(1);
  });

  it('creates a normalized blank Page for Write', async () => {
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
        async readRepositoryAccess() {
          return { directRole: 'write', governanceRole: null };
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
        async readRepositoryAccess() {
          return { directRole: 'write', governanceRole: null };
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
        async readRepositoryAccess() {
          return { directRole: 'write', governanceRole: null };
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
