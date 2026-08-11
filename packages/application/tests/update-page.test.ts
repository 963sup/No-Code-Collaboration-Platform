import { describe, expect, it, vi } from 'vitest';

import {
  UpdatePage,
  type IdentityProvider,
  type PageWriter,
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

function identityProvider(): IdentityProvider {
  return {
    async authenticateWithPassword() {
      return { ok: false, reason: 'invalid-credentials' };
    },
    async getCurrentIdentity() {
      return { email: 'actor@example.com', id: 'user-1' };
    },
    async signOut() {}
  };
}

function repositoryReader(): RepositoryReader {
  return {
    async findAccessibleRepositoryById() {
      return repository;
    },
    async listAccessibleRepositories() {
      return [repository];
    }
  };
}

const input = {
  body: 'Updated collaboration content.',
  expectedUpdatedAt: '2026-08-12T00:00:00.000Z',
  pageId: 'page-1',
  repositoryId: repository.id,
  title: 'Updated page'
};

describe('UpdatePage', () => {
  it('rejects a Viewer before persistence', async () => {
    const updatePage = vi.fn();
    const useCase = new UpdatePage(
      identityProvider(),
      repositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'viewer', organizationRole: null };
        }
      },
      { createPage: vi.fn(), updatePage }
    );

    await expect(useCase.execute(input)).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(updatePage).not.toHaveBeenCalled();
  });

  it('updates a Page for a Contributor with optimistic concurrency evidence', async () => {
    const page = {
      content: { body: input.body },
      createdAt: '2026-08-12T00:00:00.000Z',
      createdBy: 'user-1',
      id: input.pageId,
      kind: 'page' as const,
      repositoryId: repository.id,
      title: input.title,
      updatedAt: '2026-08-12T00:05:00.000Z'
    };
    const updatePage = vi.fn().mockResolvedValue(page);
    const pageWriter: PageWriter = { createPage: vi.fn(), updatePage };
    const useCase = new UpdatePage(
      identityProvider(),
      repositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'contributor', organizationRole: null };
        }
      },
      pageWriter
    );

    await expect(useCase.execute(input)).resolves.toEqual({ ok: true, page });
    expect(updatePage).toHaveBeenCalledWith({
      content: { body: input.body },
      expectedUpdatedAt: input.expectedUpdatedAt,
      id: input.pageId,
      repositoryId: repository.id,
      title: input.title
    });
  });

  it('reports changed state when concurrency or authority evidence is stale', async () => {
    const useCase = new UpdatePage(
      identityProvider(),
      repositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'contributor', organizationRole: null };
        }
      },
      { createPage: vi.fn(), updatePage: vi.fn().mockResolvedValue(null) }
    );

    await expect(useCase.execute(input)).resolves.toEqual({
      ok: false,
      reason: 'state-changed'
    });
  });

  it('rejects an invalid Page transition before persistence', async () => {
    const updatePage = vi.fn();
    const useCase = new UpdatePage(
      identityProvider(),
      repositoryReader(),
      {
        async readRepositoryAuthoritySources() {
          return { directRole: 'contributor', organizationRole: null };
        }
      },
      { createPage: vi.fn(), updatePage }
    );

    await expect(useCase.execute({ ...input, title: ' ' })).resolves.toEqual({
      ok: false,
      reason: 'invalid-page'
    });
    expect(updatePage).not.toHaveBeenCalled();
  });
});
