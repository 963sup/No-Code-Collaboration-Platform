import { describe, expect, it, vi } from 'vitest';

import {
  ExplainCurrentRepositoryAccess,
  type IdentityProvider,
  type RepositoryAccessReader,
  type RepositoryReader
} from '../src/index';

type AccessibleRepository = NonNullable<
  Awaited<ReturnType<RepositoryReader['findAccessibleRepositoryById']>>
>;

const privateRepository: AccessibleRepository = {
  description: null,
  id: 'repository-1',
  name: 'Platform',
  owner: { kind: 'user' as const, userId: 'owner-1' },
  slug: 'platform',
  visibility: 'private'
};

function identityProvider(actorId: string | null): IdentityProvider {
  return {
    async authenticateWithPassword() {
      return { ok: false, reason: 'invalid-credentials' };
    },
    async getCurrentIdentity() {
      return actorId ? { email: null, id: actorId } : null;
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

function repositoryReader(repository: AccessibleRepository | null): RepositoryReader {
  return {
    async findAccessibleRepositoryById() {
      return repository;
    },
    async listAccessibleRepositories() {
      return repository ? [repository] : [];
    }
  };
}

describe('ExplainCurrentRepositoryAccess', () => {
  it('explains current Actor direct authority without querying another User', async () => {
    const readRepositoryAccess = vi.fn().mockResolvedValue({
      directRole: 'contributor',
      governanceRole: null
    });
    const accessReader: RepositoryAccessReader = { readRepositoryAccess };
    const useCase = new ExplainCurrentRepositoryAccess(
      identityProvider('actor-1'),
      repositoryReader(privateRepository),
      accessReader
    );

    await expect(useCase.execute(privateRepository.id)).resolves.toEqual({
      actorId: 'actor-1',
      explanation: {
        effectiveCapabilities: [
          'repository.view',
          'resource.view',
          'resource.create',
          'resource.update'
        ],
        effectiveRole: 'contributor',
        sources: [{ kind: 'direct-grant', role: 'contributor' }],
        visibility: 'private'
      },
      ok: true,
      repositoryId: privateRepository.id
    });
    expect(readRepositoryAccess).toHaveBeenCalledWith({
      actorId: 'actor-1',
      repositoryId: privateRepository.id
    });
  });

  it('adds public read baseline without manufacturing mutation authority', async () => {
    const publicRepository: AccessibleRepository = {
      ...privateRepository,
      visibility: 'public'
    };
    const accessReader: RepositoryAccessReader = {
      async readRepositoryAccess() {
        return { directRole: null, governanceRole: null };
      }
    };
    const useCase = new ExplainCurrentRepositoryAccess(
      identityProvider('actor-1'),
      repositoryReader(publicRepository),
      accessReader
    );

    await expect(useCase.execute(publicRepository.id)).resolves.toMatchObject({
      explanation: {
        effectiveCapabilities: ['repository.view', 'resource.view'],
        effectiveRole: null,
        sources: [{ kind: 'public-visibility' }]
      },
      ok: true
    });
  });

  it('fails before Repository lookup when no ordinary Actor exists', async () => {
    const findAccessibleRepositoryById = vi.fn();
    const readRepositoryAccess = vi.fn();
    const reader: RepositoryReader = {
      findAccessibleRepositoryById,
      async listAccessibleRepositories() {
        return [];
      }
    };
    const useCase = new ExplainCurrentRepositoryAccess(identityProvider(null), reader, {
      readRepositoryAccess
    });

    await expect(useCase.execute(privateRepository.id)).resolves.toEqual({
      ok: false,
      reason: 'unauthenticated'
    });
    expect(findAccessibleRepositoryById).not.toHaveBeenCalled();
    expect(readRepositoryAccess).not.toHaveBeenCalled();
  });

  it('does not expose authority sources for an unavailable Repository', async () => {
    const readRepositoryAccess = vi.fn();
    const useCase = new ExplainCurrentRepositoryAccess(
      identityProvider('actor-1'),
      repositoryReader(null),
      { readRepositoryAccess }
    );

    await expect(useCase.execute('private-or-missing')).resolves.toEqual({
      ok: false,
      reason: 'repository-unavailable'
    });
    expect(readRepositoryAccess).not.toHaveBeenCalled();
  });
});
