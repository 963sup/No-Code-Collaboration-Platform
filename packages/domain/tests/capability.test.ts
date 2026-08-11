import { describe, expect, it } from 'vitest';

import { hasRepositoryCapability, highestRepositoryRole, isRepositorySlug } from '../src/index';

describe('repository capability policy', () => {
  it('keeps viewer access read-only', () => {
    expect(hasRepositoryCapability('viewer', 'repository.view')).toBe(true);
    expect(hasRepositoryCapability('viewer', 'resource.view')).toBe(true);
    expect(hasRepositoryCapability('viewer', 'resource.update')).toBe(false);
  });

  it('treats roles as monotonic convenience bundles', () => {
    expect(hasRepositoryCapability('contributor', 'resource.update')).toBe(true);
    expect(hasRepositoryCapability('manager', 'member.manage')).toBe(true);
    expect(hasRepositoryCapability('admin', 'repository.manage')).toBe(true);
  });

  it('selects the highest effective role without introducing deny precedence', () => {
    expect(highestRepositoryRole(['viewer', 'manager', 'contributor'])).toBe('manager');
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
