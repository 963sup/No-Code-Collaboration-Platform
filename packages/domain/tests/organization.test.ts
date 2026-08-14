import { describe, expect, it } from 'vitest';

import { createOrganizationDraft } from '../src/index';

describe('Organization creation', () => {
  it('creates a normalized Organization draft for the authenticated founder', () => {
    expect(
      createOrganizationDraft({
        createdBy: 'user-1',
        name: '  Operations Group  ',
        slug: 'operations-group'
      })
    ).toEqual({
      createdBy: 'user-1',
      name: 'Operations Group',
      slug: 'operations-group'
    });
  });

  it.each([
    { createdBy: '', name: 'Operations', slug: 'operations' },
    { createdBy: 'user-1', name: '   ', slug: 'operations' },
    { createdBy: 'user-1', name: 'Operations', slug: 'Operations' },
    { createdBy: 'user-1', name: 'Operations', slug: 'operations--group' },
    { createdBy: 'user-1', name: 'Operations', slug: 'organizations' }
  ])('rejects an invalid Organization draft %#', (input) => {
    expect(createOrganizationDraft(input)).toBeNull();
  });
});
