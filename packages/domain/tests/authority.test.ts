import { describe, expect, it } from 'vitest';

import {
  decideRepositoryCapability,
  effectiveRepositoryRole,
  explainRepositoryAccess
} from '../src/access';

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

describe('Repository access explanation', () => {
  it('preserves distinct direct and governance authority sources', () => {
    expect(
      explainRepositoryAccess({
        sources: {
          directRole: 'contributor',
          governanceRole: 'admin'
        },
        visibility: 'private'
      })
    ).toEqual({
      effectiveCapabilities: [
        'repository.view',
        'repository.manage',
        'resource.view',
        'resource.create',
        'resource.update',
        'member.manage'
      ],
      effectiveRole: 'admin',
      sources: [
        { kind: 'direct-grant', role: 'contributor' },
        { kind: 'governance-derived', role: 'admin' }
      ],
      visibility: 'private'
    });
  });

  it('explains public visibility as read baseline without fabricating a Role', () => {
    expect(
      explainRepositoryAccess({
        sources: {
          directRole: null,
          governanceRole: null
        },
        visibility: 'public'
      })
    ).toEqual({
      effectiveCapabilities: ['repository.view', 'resource.view'],
      effectiveRole: null,
      sources: [{ kind: 'public-visibility' }],
      visibility: 'public'
    });
  });

  it('uses the same explanation inputs for capability allow/deny', () => {
    const input = {
      sources: {
        directRole: null,
        governanceRole: null
      },
      visibility: 'public' as const
    };

    expect(decideRepositoryCapability(input, 'repository.view').allowed).toBe(true);
    expect(decideRepositoryCapability(input, 'resource.update').allowed).toBe(false);
  });
});
