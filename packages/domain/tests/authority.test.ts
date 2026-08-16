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
        actorTrust: 'authenticated',
        sources: {
          directRole: 'write',
          governanceRole: 'admin'
        },
        visibility: 'private'
      })
    ).toEqual({
      actorTrust: 'authenticated',
      effectiveCapabilities: repositoryCapabilities,
      effectiveRole: 'admin',
      sources: [
        { kind: 'direct-grant', role: 'write' },
        { kind: 'governance-derived', role: 'admin' }
      ],
      visibility: 'private'
    });
  });

  it('keeps anonymous public access read-only without fabricating a Role', () => {
    expect(
      explainRepositoryAccess({
        actorTrust: 'anonymous',
        sources: {
          directRole: null,
          governanceRole: null
        },
        visibility: 'public'
      })
    ).toEqual({
      actorTrust: 'anonymous',
      effectiveCapabilities: ['repository.view', 'resource.view'],
      effectiveRole: null,
      sources: [{ kind: 'public-visibility' }],
      visibility: 'public'
    });
  });

  it('adds GitHub-style authenticated Issue and Discussion participation on a public Repository', () => {
    const explanation = explainRepositoryAccess({
      actorTrust: 'authenticated',
      sources: { directRole: null, governanceRole: null },
      visibility: 'public'
    });

    expect(explanation.effectiveRole).toBeNull();
    expect(explanation.effectiveCapabilities).toEqual([
      'repository.view',
      'resource.view',
      'issue.create',
      'issue.comment',
      'discussion.create',
      'discussion.comment'
    ]);
    expect(explanation.effectiveCapabilities).not.toContain('page.update');
  });

  it('allows a public Repository collaborator to edit Wiki/Page while private Read stays read-only', () => {
    expect(
      decideRepositoryCapability(
        {
          actorTrust: 'authenticated',
          sources: { directRole: 'read', governanceRole: null },
          visibility: 'public'
        },
        'page.update'
      ).allowed
    ).toBe(true);

    expect(
      decideRepositoryCapability(
        {
          actorTrust: 'authenticated',
          sources: { directRole: 'read', governanceRole: null },
          visibility: 'private'
        },
        'page.update'
      ).allowed
    ).toBe(false);
  });
});
