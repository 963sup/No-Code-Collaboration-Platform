import { describe, expect, it } from 'vitest';

import {
  canMutateOrganizationMembership,
  canMutateRepositoryGrant,
  preservesOrganizationOwnership
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
  it('allows managers to manage viewer and contributor grants', () => {
    expect(canMutateRepositoryGrant('manager', null, 'viewer')).toBe(true);
    expect(canMutateRepositoryGrant('manager', 'viewer', 'contributor')).toBe(true);
    expect(canMutateRepositoryGrant('manager', 'contributor', null)).toBe(true);
  });

  it('prevents managers from creating or managing manager and admin grants', () => {
    expect(canMutateRepositoryGrant('manager', null, 'manager')).toBe(false);
    expect(canMutateRepositoryGrant('manager', null, 'admin')).toBe(false);
    expect(canMutateRepositoryGrant('manager', 'manager', 'admin')).toBe(false);
    expect(canMutateRepositoryGrant('manager', 'admin', null)).toBe(false);
  });

  it('allows repository administrators to manage every repository role', () => {
    expect(canMutateRepositoryGrant('admin', null, 'admin')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'manager', 'admin')).toBe(true);
    expect(canMutateRepositoryGrant('admin', 'admin', null)).toBe(true);
  });

  it('does not treat read or contribution capabilities as delegation authority', () => {
    expect(canMutateRepositoryGrant('viewer', null, 'viewer')).toBe(false);
    expect(canMutateRepositoryGrant('contributor', null, 'viewer')).toBe(false);
  });
});
