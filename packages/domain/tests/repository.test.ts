import { describe, expect, it } from 'vitest';

import {
  createRepositoryDraft,
  repositoryOwnerReservedSlugs,
  repositoryVisibilities,
  type RepositoryOwner
} from '../src/index';

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

  it('reserves command-route segments from the canonical Owner namespace', () => {
    expect(repositoryOwnerReservedSlugs).toContain('organizations');
    expect(repositoryOwnerReservedSlugs).toContain('new');
  });

  it('creates a normalized Repository draft without fabricating a Grant', () => {
    expect(
      createRepositoryDraft({
        createdBy: 'user-1',
        description: '  Shared planning space  ',
        name: '  Customer workspace  ',
        owner: personalOwner,
        slug: 'customer-workspace',
        visibility: 'private'
      })
    ).toEqual({
      createdBy: 'user-1',
      description: 'Shared planning space',
      name: 'Customer workspace',
      owner: personalOwner,
      slug: 'customer-workspace',
      visibility: 'private'
    });
  });

  it.each([
    { name: '   ', slug: 'valid-slug', visibility: 'private' },
    { name: 'Repository', slug: 'Not-Canonical', visibility: 'private' },
    { name: 'Repository', slug: 'valid-slug', visibility: 'internal' }
  ])('rejects an invalid Repository draft %#', ({ name, slug, visibility }) => {
    expect(
      createRepositoryDraft({
        createdBy: 'user-1',
        name,
        owner: personalOwner,
        slug,
        visibility
      })
    ).toBeNull();
  });
});
