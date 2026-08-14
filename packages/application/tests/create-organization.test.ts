import { describe, expect, it, vi } from 'vitest';

import { CreateOrganization, type IdentityProvider, type OrganizationWriter } from '../src/index';

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

function successfulWriter(): OrganizationWriter {
  return {
    async createOrganization(draft) {
      return {
        ok: true,
        organization: {
          createdBy: draft.createdBy,
          id: 'organization-1',
          name: draft.name,
          slug: draft.slug
        }
      };
    }
  };
}

describe('Organization creation', () => {
  it('requires an authenticated Actor before persistence', async () => {
    const createOrganization = vi.fn();
    const useCase = new CreateOrganization(createIdentityProvider(null), { createOrganization });

    await expect(useCase.execute({ name: 'Operations', slug: 'operations' })).resolves.toEqual({
      ok: false,
      reason: 'unauthenticated'
    });
    expect(createOrganization).not.toHaveBeenCalled();
  });

  it('creates a normalized Organization attributed to the Actor', async () => {
    const createOrganization = vi.fn(successfulWriter().createOrganization);
    const useCase = new CreateOrganization(createIdentityProvider('user-1'), {
      createOrganization
    });

    await expect(
      useCase.execute({ name: '  Operations Group  ', slug: 'operations-group' })
    ).resolves.toEqual({
      ok: true,
      organization: {
        createdBy: 'user-1',
        id: 'organization-1',
        name: 'Operations Group',
        slug: 'operations-group'
      }
    });
    expect(createOrganization).toHaveBeenCalledWith({
      createdBy: 'user-1',
      name: 'Operations Group',
      slug: 'operations-group'
    });
  });

  it('rejects invalid input before persistence and preserves provider-safe failures', async () => {
    const createOrganization = vi.fn();
    const invalidUseCase = new CreateOrganization(createIdentityProvider('user-1'), {
      createOrganization
    });

    await expect(
      invalidUseCase.execute({ name: 'Operations', slug: 'Not-Canonical' })
    ).resolves.toEqual({ ok: false, reason: 'invalid-input' });
    expect(createOrganization).not.toHaveBeenCalled();

    const collisionUseCase = new CreateOrganization(createIdentityProvider('user-1'), {
      async createOrganization() {
        return { ok: false, reason: 'slug-taken' };
      }
    });
    await expect(
      collisionUseCase.execute({ name: 'Operations', slug: 'operations' })
    ).resolves.toEqual({ ok: false, reason: 'slug-taken' });
  });
});
