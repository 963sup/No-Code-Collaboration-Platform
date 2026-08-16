import { describe, expect, it } from 'vitest';

import { hasRepositoryCapability, highestRepositoryRole, isRepositorySlug } from '../src/index';

describe('repository capability policy', () => {
  it('maps Read to collaboration participation without write or administration', () => {
    expect(hasRepositoryCapability('read', 'repository.view')).toBe(true);
    expect(hasRepositoryCapability('read', 'issue.create')).toBe(true);
    expect(hasRepositoryCapability('read', 'discussion.create')).toBe(true);
    expect(hasRepositoryCapability('read', 'page.update')).toBe(false);
    expect(hasRepositoryCapability('read', 'repository.access.manage')).toBe(false);
  });

  it('maps Triage to Issue and Discussion management without Page write or Repository access management', () => {
    expect(hasRepositoryCapability('triage', 'issue.manage')).toBe(true);
    expect(hasRepositoryCapability('triage', 'discussion.moderate')).toBe(true);
    expect(hasRepositoryCapability('triage', 'page.update')).toBe(false);
    expect(hasRepositoryCapability('triage', 'repository.access.manage')).toBe(false);
  });

  it('maps Write and Maintain to surviving no-code GitHub responsibilities', () => {
    expect(hasRepositoryCapability('write', 'page.update')).toBe(true);
    expect(hasRepositoryCapability('write', 'discussion.comment.locked')).toBe(true);
    expect(hasRepositoryCapability('write', 'discussion.announce')).toBe(false);
    expect(hasRepositoryCapability('maintain', 'discussion.announce')).toBe(true);
    expect(hasRepositoryCapability('maintain', 'repository.access.manage')).toBe(false);
  });

  it('reserves sensitive Repository settings and Direct access management to Admin', () => {
    expect(hasRepositoryCapability('admin', 'repository.manage')).toBe(true);
    expect(hasRepositoryCapability('admin', 'repository.access.manage')).toBe(true);
  });

  it('selects the highest effective role without introducing deny precedence', () => {
    expect(highestRepositoryRole(['read', 'maintain', 'write', 'triage'])).toBe('maintain');
    expect(highestRepositoryRole(['read', 'admin', 'maintain'])).toBe('admin');
    expect(highestRepositoryRole([])).toBeNull();
  });
});

describe('repository slug invariant', () => {
  it.each(['platform', 'no-code-platform', 'repository-01'])('accepts %s', (slug) => {
    expect(isRepositorySlug(slug)).toBe(true);
  });

  it.each(['A', '-platform', 'platform-', 'no_code'])('rejects %s', (slug) => {
    expect(isRepositorySlug(slug)).toBe(false);
  });
});
