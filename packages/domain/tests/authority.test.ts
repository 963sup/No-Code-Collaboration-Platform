import { describe, expect, it } from 'vitest';

import {
  decideRepositoryCapability,
  effectiveRepositoryRole,
  explainRepositoryAccess,
  repositoryCapabilities
} from '../src/access';

describe('effective Repository authority', () => {
  it('maps ownership/governance authority to Repository Admin', () => {
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

  it('selects the highest direct and governance-derived Repository Role', () => {
    expect(
      effectiveRepositoryRole({
        directRole: 'maintain',
        governanceRole: null
      })
    ).toBe('maintain');
    expect(
      effectiveRepositoryRole({
        directRole: 'write',
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
          directRole: 'write',
          governanceRole: 'admin'
        },
        visibility: 'private'
      })
    ).toEqual({
      effectiveCapabilities: repositoryCapabilities,
      effectiveRole: 'admin',
      sources: [
        { kind: 'direct-grant', role: 'write' },
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
    expect(decideRepositoryCapability(input, 'page.update').allowed).toBe(false);
  });
});
