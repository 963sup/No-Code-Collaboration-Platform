import { describe, expect, it } from 'vitest';

import { effectiveRepositoryRole } from '../src/index';

describe('effective Repository authority', () => {
  it('maps ownership/governance authority to Repository admin', () => {
    expect(
      effectiveRepositoryRole({
        directRole: null,
        governanceRole: 'admin'
      })
    ).toBe('admin');
  });

  it('keeps absent governance authority separate from Repository authority', () => {
    expect(
      effectiveRepositoryRole({
        directRole: null,
        governanceRole: null
      })
    ).toBeNull();
  });

  it('selects the highest direct and governance-derived Repository role', () => {
    expect(
      effectiveRepositoryRole({
        directRole: 'manager',
        governanceRole: null
      })
    ).toBe('manager');
    expect(
      effectiveRepositoryRole({
        directRole: 'contributor',
        governanceRole: 'admin'
      })
    ).toBe('admin');
  });
});
