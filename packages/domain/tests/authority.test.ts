import { describe, expect, it } from 'vitest';

import { effectiveRepositoryRole } from '../src/index';

describe('effective Repository authority', () => {
  it('maps Organization governance authority to Repository admin', () => {
    expect(
      effectiveRepositoryRole({
        directRole: null,
        organizationRole: 'owner'
      })
    ).toBe('admin');
    expect(
      effectiveRepositoryRole({
        directRole: 'viewer',
        organizationRole: 'admin'
      })
    ).toBe('admin');
  });

  it('keeps ordinary Organization membership separate from Repository authority', () => {
    expect(
      effectiveRepositoryRole({
        directRole: null,
        organizationRole: 'member'
      })
    ).toBeNull();
  });

  it('selects the highest direct and governance-derived Repository role', () => {
    expect(
      effectiveRepositoryRole({
        directRole: 'manager',
        organizationRole: null
      })
    ).toBe('manager');
    expect(
      effectiveRepositoryRole({
        directRole: 'contributor',
        organizationRole: 'owner'
      })
    ).toBe('admin');
  });
});
