import { describe, expect, it } from 'vitest';

import { canCreateRepositoryForOwner, repositoryCreationCapability } from '../src/index';

describe('Repository creation Access Policy', () => {
  it('defines creation as an Owner-scoped action before Repository identity exists', () => {
    expect(repositoryCreationCapability).toBe('repository.create');
  });

  it('allows a User to create only in its own personal Owner scope', () => {
    expect(
      canCreateRepositoryForOwner({
        actorId: 'user-1',
        organizationRole: null,
        owner: { kind: 'user', userId: 'user-1' }
      })
    ).toBe(true);
    expect(
      canCreateRepositoryForOwner({
        actorId: 'user-1',
        organizationRole: null,
        owner: { kind: 'user', userId: 'user-2' }
      })
    ).toBe(false);
  });

  it.each(['owner', 'admin'] as const)(
    'allows an Organization %s to create in that Organization Owner scope',
    (organizationRole) => {
      expect(
        canCreateRepositoryForOwner({
          actorId: 'user-1',
          organizationRole,
          owner: { kind: 'organization', organizationId: 'organization-1' }
        })
      ).toBe(true);
    }
  );

  it.each(['member', null] as const)(
    'denies Organization creation without owner/admin governance authority (%s)',
    (organizationRole) => {
      expect(
        canCreateRepositoryForOwner({
          actorId: 'user-1',
          organizationRole,
          owner: { kind: 'organization', organizationId: 'organization-1' }
        })
      ).toBe(false);
    }
  );

  it('fails closed without an authenticated Actor identity', () => {
    expect(
      canCreateRepositoryForOwner({
        actorId: '',
        organizationRole: 'owner',
        owner: { kind: 'organization', organizationId: 'organization-1' }
      })
    ).toBe(false);
  });
});
