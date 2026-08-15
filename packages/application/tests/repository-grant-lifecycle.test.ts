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

function accessReader(role: 'admin' | 'manager'): RepositoryAccessReader {
  return {
    async readRepositoryAccess() {
      return { directRole: null, governanceRole: role };
    }
  };
}

function grantRepository(
  grants: Awaited<ReturnType<RepositoryGrantRepository['listDirectRepositoryGrants']>> = []
) {
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
    async listDirectRepositoryGrants() {
      return grants;
    },
    mutateDirectRepositoryGrant
  };
  return { mutateDirectRepositoryGrant, repositoryGrantRepository };
}

describe('Repository Grant management', () => {
  it('projects only delegation transitions the Actor may perform', async () => {
    const { repositoryGrantRepository } = grantRepository([
      {
        avatarUrl: null,
        displayName: 'Viewer',
        id: 'user-viewer',
        role: 'viewer',
        username: 'viewer'
      },
      {
        avatarUrl: null,
        displayName: 'Manager',
        id: 'user-manager',
        role: 'manager',
        username: 'manager'
      }
    ]);
    const useCase = new GetRepositoryGrantManagement(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('manager'),
      repositoryGrantRepository
    );

    await expect(useCase.execute(repository.id)).resolves.toEqual({
      actorRole: 'manager',
      grantableRoles: ['viewer', 'contributor'],
      grants: [
        expect.objectContaining({
          allowedRoles: ['contributor'],
          canRevoke: true,
          id: 'user-viewer',
          role: 'viewer'
        }),
        expect.objectContaining({
          allowedRoles: [],
          canRevoke: false,
          id: 'user-manager',
          role: 'manager'
        })
      ],
      ok: true
    });
  });

  it('creates a direct Grant only after Domain delegation accepts another Principal', async () => {
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
        role: 'contributor',
        type: 'grant',
        username: 'collaborator'
      })
    ).resolves.toEqual({ ok: true, changed: true });
    expect(mutateDirectRepositoryGrant).toHaveBeenCalledWith({
      expectedRole: null,
      proposedRole: 'contributor',
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

  it('passes the observed current Role as an optimistic concurrency precondition', async () => {
    const { mutateDirectRepositoryGrant, repositoryGrantRepository } = grantRepository([
      {
        avatarUrl: null,
        displayName: 'Collaborator',
        id: 'user-2',
        role: 'contributor',
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
        role: 'viewer',
        targetUserId: 'user-2',
        type: 'change-role'
      })
    ).resolves.toEqual({ ok: true, changed: true });
    expect(mutateDirectRepositoryGrant).toHaveBeenCalledWith({
      expectedRole: 'contributor',
      proposedRole: 'viewer',
      repositoryId: repository.id,
      targetUserId: 'user-2'
    });
  });
});
