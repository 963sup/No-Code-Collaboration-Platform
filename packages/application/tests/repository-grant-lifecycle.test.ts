import { describe, expect, it, vi } from 'vitest';

import {
  ExecuteRepositoryGrantCommand,
  GetRepositoryGrantManagement,
  type IdentityProvider,
  type RepositoryAccessReader,
  type RepositoryGrantRepository,
  type RepositoryReader
} from '../src/index';

type AccessibleRepository = NonNullable<
  Awaited<ReturnType<RepositoryReader['findAccessibleRepositoryById']>>
>;

const repository: AccessibleRepository = {
  description: null,
  id: 'repository-1',
  name: 'Platform',
  owner: { kind: 'organization' as const, organizationId: 'organization-1' },
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

const repositoryReader: RepositoryReader = {
  async findAccessibleRepositoryById() {
    return repository;
  },
  async listAccessibleRepositories() {
    return [repository];
  }
};

function accessReader(role: 'admin' | 'maintain'): RepositoryAccessReader {
  return {
    async readRepositoryAccess() {
      return { directRole: null, governanceRole: role };
    }
  };
}

function grantRepository(
  grants: Awaited<ReturnType<RepositoryGrantRepository['listDirectRepositoryGrants']>> = []
) {
  const listDirectRepositoryGrants = vi.fn().mockResolvedValue(grants);
  const mutateDirectRepositoryGrant = vi.fn().mockResolvedValue({ ok: true, changed: true });
  const repositoryGrantRepository: RepositoryGrantRepository = {
    async findGrantTargetByUsername(_repositoryId, username) {
      return username === 'collaborator'
        ? {
            avatarUrl: null,
            displayName: 'Collaborator',
            id: 'user-2',
            username
          }
        : username === 'actor'
          ? { avatarUrl: null, displayName: 'Actor', id: 'actor-1', username }
          : null;
    },
    listDirectRepositoryGrants,
    mutateDirectRepositoryGrant
  };
  return { listDirectRepositoryGrants, mutateDirectRepositoryGrant, repositoryGrantRepository };
}

describe('Repository Grant management', () => {
  it('does not expose the management projection to Maintain', async () => {
    const { listDirectRepositoryGrants, repositoryGrantRepository } = grantRepository();
    const useCase = new GetRepositoryGrantManagement(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('maintain'),
      repositoryGrantRepository
    );

    await expect(useCase.execute(repository.id)).resolves.toEqual({
      ok: false,
      reason: 'forbidden'
    });
    expect(listDirectRepositoryGrants).not.toHaveBeenCalled();
  });

  it('projects every accepted Repository Role only for Admin', async () => {
    const { repositoryGrantRepository } = grantRepository([
      {
        avatarUrl: null,
        displayName: 'Reader',
        id: 'user-read',
        role: 'read',
        username: 'reader'
      },
      {
        avatarUrl: null,
        displayName: 'Maintainer',
        id: 'user-maintain',
        role: 'maintain',
        username: 'maintainer'
      }
    ]);
    const useCase = new GetRepositoryGrantManagement(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('admin'),
      repositoryGrantRepository
    );

    const result = await useCase.execute(repository.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.actorRole).toBe('admin');
    expect(result.grantableRoles).toEqual(['read', 'triage', 'write', 'maintain', 'admin']);
    expect(result.grants).toEqual([
      expect.objectContaining({
        allowedRoles: ['triage', 'write', 'maintain', 'admin'],
        canRevoke: true,
        id: 'user-read',
        role: 'read'
      }),
      expect.objectContaining({
        allowedRoles: ['read', 'triage', 'write', 'admin'],
        canRevoke: true,
        id: 'user-maintain',
        role: 'maintain'
      })
    ]);
  });

  it('creates a Direct Grant only after Admin delegation accepts another Principal', async () => {
    const { mutateDirectRepositoryGrant, repositoryGrantRepository } = grantRepository();
    const useCase = new ExecuteRepositoryGrantCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('admin'),
      repositoryGrantRepository
    );

    await expect(
      useCase.execute({
        repositoryId: repository.id,
        role: 'write',
        type: 'grant',
        username: 'collaborator'
      })
    ).resolves.toEqual({ ok: true, changed: true });
    expect(mutateDirectRepositoryGrant).toHaveBeenCalledWith({
      expectedRole: null,
      proposedRole: 'write',
      repositoryId: repository.id,
      targetUserId: 'user-2'
    });
  });

  it('rejects self-target Direct Grant creation before persistence', async () => {
    const { mutateDirectRepositoryGrant, repositoryGrantRepository } = grantRepository();
    const useCase = new ExecuteRepositoryGrantCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('admin'),
      repositoryGrantRepository
    );

    await expect(
      useCase.execute({
        repositoryId: repository.id,
        role: 'admin',
        type: 'grant',
        username: 'actor'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(mutateDirectRepositoryGrant).not.toHaveBeenCalled();
  });

  it('passes the observed current Role as the persistence CAS precondition', async () => {
    const { mutateDirectRepositoryGrant, repositoryGrantRepository } = grantRepository([
      {
        avatarUrl: null,
        displayName: 'Collaborator',
        id: 'user-2',
        role: 'write',
        username: 'collaborator'
      }
    ]);
    const useCase = new ExecuteRepositoryGrantCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('admin'),
      repositoryGrantRepository
    );

    await expect(
      useCase.execute({
        repositoryId: repository.id,
        role: 'read',
        targetUserId: 'user-2',
        type: 'change-role'
      })
    ).resolves.toEqual({ ok: true, changed: true });
    expect(mutateDirectRepositoryGrant).toHaveBeenCalledWith({
      expectedRole: 'write',
      proposedRole: 'read',
      repositoryId: repository.id,
      targetUserId: 'user-2'
    });
  });
});
