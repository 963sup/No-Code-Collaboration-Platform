import { describe, expect, it, vi } from 'vitest';

import {
  CreateRepository,
  ListRepositoryCreationOwners,
  RepositoryCreationAccessPolicy,
  type IdentityProvider,
  type RepositoryCreationAccessReader,
  type RepositoryCreationOwnerCandidate,
  type RepositoryWriter
} from '../src/index';

const personalOwner = {
  name: 'Actor',
  organizationRole: null,
  owner: { kind: 'user' as const, userId: 'user-1' },
  slug: 'actor'
} satisfies RepositoryCreationOwnerCandidate;

const organizationOwner = {
  name: 'Operations',
  organizationRole: 'owner' as const,
  owner: { kind: 'organization' as const, organizationId: 'organization-1' },
  slug: 'operations'
} satisfies RepositoryCreationOwnerCandidate;

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

function createAccessReader(
  candidates: readonly RepositoryCreationOwnerCandidate[] = [personalOwner, organizationOwner]
): RepositoryCreationAccessReader {
  return {
    async listRepositoryCreationOwnerCandidates() {
      return candidates;
    }
  };
}

function createAccessPolicy(
  candidates: readonly RepositoryCreationOwnerCandidate[] = [personalOwner, organizationOwner]
) {
  return new RepositoryCreationAccessPolicy(createAccessReader(candidates));
}

function successfulWriter(): RepositoryWriter {
  return {
    async createRepository(draft) {
      return {
        ok: true,
        repository: {
          description: draft.description,
          id: 'repository-1',
          name: draft.name,
          owner: draft.owner,
          slug: draft.slug,
          visibility: draft.visibility
        }
      };
    }
  };
}

describe('Repository creation', () => {
  it('does not expose creation owners without an authenticated Actor', async () => {
    const listRepositoryCreationOwnerCandidates = vi.fn();
    const query = new ListRepositoryCreationOwners(
      createIdentityProvider(null),
      new RepositoryCreationAccessPolicy({ listRepositoryCreationOwnerCandidates })
    );

    await expect(query.execute()).resolves.toEqual([]);
    expect(listRepositoryCreationOwnerCandidates).not.toHaveBeenCalled();
  });

  it('lists only Owner scopes accepted by Access Policy', async () => {
    const memberCandidate = {
      ...organizationOwner,
      name: 'Member Organization',
      organizationRole: 'member' as const,
      owner: { kind: 'organization' as const, organizationId: 'organization-2' },
      slug: 'member-organization'
    };
    const query = new ListRepositoryCreationOwners(
      createIdentityProvider('user-1'),
      createAccessPolicy([personalOwner, organizationOwner, memberCandidate])
    );

    await expect(query.execute()).resolves.toEqual([
      { name: 'Actor', owner: personalOwner.owner, slug: 'actor' },
      { name: 'Operations', owner: organizationOwner.owner, slug: 'operations' }
    ]);
  });

  it('creates a personal Repository through a typed owner contract', async () => {
    const createRepository = vi.fn(successfulWriter().createRepository);
    const useCase = new CreateRepository(createIdentityProvider('user-1'), createAccessPolicy(), {
      createRepository
    });

    await expect(
      useCase.execute({
        description: '  Shared planning space  ',
        name: '  Customer workspace  ',
        owner: personalOwner.owner,
        slug: 'customer-workspace',
        visibility: 'private'
      })
    ).resolves.toMatchObject({
      ok: true,
      ownerSlug: 'actor',
      repository: {
        name: 'Customer workspace',
        owner: personalOwner.owner,
        slug: 'customer-workspace'
      }
    });
    expect(createRepository).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'user-1', owner: personalOwner.owner })
    );
  });

  it('accepts an Organization returned by the governance-aware owner reader', async () => {
    const useCase = new CreateRepository(
      createIdentityProvider('user-1'),
      createAccessPolicy(),
      successfulWriter()
    );

    await expect(
      useCase.execute({
        name: 'Operations workspace',
        owner: organizationOwner.owner,
        slug: 'operations-workspace',
        visibility: 'public'
      })
    ).resolves.toMatchObject({
      ok: true,
      ownerSlug: 'operations',
      repository: { owner: organizationOwner.owner }
    });
  });

  it('fails closed before persistence when Access Policy rejects the Owner scope', async () => {
    const createRepository = vi.fn();
    const memberCandidate = { ...organizationOwner, organizationRole: 'member' as const };
    const useCase = new CreateRepository(
      createIdentityProvider('user-1'),
      createAccessPolicy([personalOwner, memberCandidate]),
      { createRepository }
    );

    await expect(
      useCase.execute({
        name: 'Forged workspace',
        owner: organizationOwner.owner,
        slug: 'forged-workspace',
        visibility: 'private'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(createRepository).not.toHaveBeenCalled();
  });

  it('preserves an RLS rejection when authority changes after the owner read', async () => {
    const useCase = new CreateRepository(createIdentityProvider('user-1'), createAccessPolicy(), {
      async createRepository() {
        return { ok: false, reason: 'forbidden' };
      }
    });

    await expect(
      useCase.execute({
        name: 'Operations workspace',
        owner: organizationOwner.owner,
        slug: 'operations-workspace',
        visibility: 'private'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
  });

  it('reports invalid fields and owner-scoped slug collisions without provider leakage', async () => {
    const invalidUseCase = new CreateRepository(
      createIdentityProvider('user-1'),
      createAccessPolicy(),
      successfulWriter()
    );
    await expect(
      invalidUseCase.execute({
        name: 'Repository',
        owner: personalOwner.owner,
        slug: 'Not-Canonical',
        visibility: 'private'
      })
    ).resolves.toEqual({ ok: false, reason: 'invalid-input' });

    const collisionUseCase = new CreateRepository(
      createIdentityProvider('user-1'),
      createAccessPolicy(),
      {
        async createRepository() {
          return { ok: false, reason: 'slug-taken' };
        }
      }
    );
    await expect(
      collisionUseCase.execute({
        name: 'Repository',
        owner: personalOwner.owner,
        slug: 'repository',
        visibility: 'private'
      })
    ).resolves.toEqual({ ok: false, reason: 'slug-taken' });
  });
});
