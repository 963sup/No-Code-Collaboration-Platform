import { describe, expect, it } from 'vitest';

import {
  canMutateOrganizationMembership,
  canMutateRepositoryGrant,
  canMutateRepositoryGrantForPrincipal,
  isRepositoryGrantRoleAllowed,
  preservesOrganizationOwnership,
  repositoryGrantRolesForOwner
} from '../src/index';

describe('organization delegation policy', () => {
  it('allows administrators to manage member and administrator relationships', () => {
    expect(canMutateOrganizationMembership('admin', null, 'member')).toBe(true);
    expect(canMutateOrganizationMembership('admin', 'member', 'admin')).toBe(true);
    expect(canMutateOrganizationMembership('admin', 'admin', null)).toBe(true);
  });

  it('prevents administrators from creating or managing owner authority', () => {
    expect(canMutateOrganizationMembership('admin', null, 'owner')).toBe(false);
    expect(canMutateOrganizationMembership('admin', 'admin', 'owner')).toBe(false);
    expect(canMutateOrganizationMembership('admin', 'owner', 'admin')).toBe(false);
    expect(canMutateOrganizationMembership('admin', 'owner', null)).toBe(false);
  });

  it('reserves owner delegation to owners', () => {
    expect(canMutateOrganizationMembership('owner', null, 'owner')).toBe(true);
    expect(canMutateOrganizationMembership('owner', 'owner', 'admin')).toBe(true);
    expect(canMutateOrganizationMembership('owner', 'owner', null)).toBe(true);
  });

  it('requires an organization to retain at least one owner', () => {
    expect(preservesOrganizationOwnership(1)).toBe(true);
    expect(preservesOrganizationOwnership(2)).toBe(true);
    expect(preservesOrganizationOwnership(0)).toBe(false);
  });
});

describe('repository delegation policy', () => {
  it.each(['read', 'triage', 'write', 'maintain'] as const)(
    'does not let %s manage Direct Repository Grants',
    (role) => {
      expect(canMutateRepositoryGrant(role, null, 'read')).toBe(false);
      expect(canMutateRepositoryGrant(role, 'write', 'maintain')).toBe(false);
      expect(canMutateRepositoryGrant(role, 'admin', null)).toBe(false);
    }
  );

  it('allows repository administrators to manage every accepted organization-owned role', () => {
    expect(canMutateRepositoryGrant('admin', null, 'read')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'read', 'triage')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'triage', 'write')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'write', 'maintain')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'maintain', 'admin')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'admin', null)).toBe(true);
  });

  it('keeps GitHub personal-repository collaborator assignment distinct from organization roles', () => {
    expect(repositoryGrantRolesForOwner('user')).toEqual(['write']);
    expect(repositoryGrantRolesForOwner('organization')).toEqual([
      'read',
      'triage',
      'write',
      'maintain',
      'admin'
    ]);

    expect(isRepositoryGrantRoleAllowed('user', 'write')).toBe(true);
    expect(isRepositoryGrantRoleAllowed('user', 'read')).toBe(false);
    expect(isRepositoryGrantRoleAllowed('user', 'triage')).toBe(false);
    expect(isRepositoryGrantRoleAllowed('user', 'maintain')).toBe(false);
    expect(isRepositoryGrantRoleAllowed('user', 'admin')).toBe(false);
    expect(isRepositoryGrantRoleAllowed('organization', 'admin')).toBe(true);
  });

  it('rejects empty transitions and self-target Direct Grant mutation', () => {
    expect(canMutateRepositoryGrant('admin', null, null)).toBe(false);
    expect(canMutateRepositoryGrantForPrincipal('admin', null, 'admin', 'actor-1', 'actor-1')).toBe(
      false
    );
    expect(canMutateRepositoryGrantForPrincipal('admin', null, 'admin', 'actor-1', 'user-2')).toBe(
      true
    );
  });
});
