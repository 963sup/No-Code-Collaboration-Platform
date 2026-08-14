import { describe, expect, it } from 'vitest';

import { repositoryVisibilities, type RepositoryOwner } from '../src/index';

const personalOwner = {
  kind: 'user',
  userId: 'user-1'
} satisfies RepositoryOwner;

const organizationOwner = {
  kind: 'organization',
  organizationId: 'organization-1'
} satisfies RepositoryOwner;

describe('Repository ownership', () => {
  it('supports User and Organization owners as typed alternatives', () => {
    expect(personalOwner).toEqual({ kind: 'user', userId: 'user-1' });
    expect(organizationOwner).toEqual({
      kind: 'organization',
      organizationId: 'organization-1'
    });
  });

  it('exposes only visibility states with accepted authorization semantics', () => {
    expect(repositoryVisibilities).toEqual(['private', 'public']);
  });
});
